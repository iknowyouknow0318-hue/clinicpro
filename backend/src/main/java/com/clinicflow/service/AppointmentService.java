package com.clinicflow.service;

import com.clinicflow.dto.AppointmentDTO;
import com.clinicflow.dto.SlotDTO;
import com.clinicflow.entity.*;
import com.clinicflow.exception.BadRequestException;
import com.clinicflow.exception.DuplicateResourceException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.*;
import com.clinicflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final VisitRepository visitRepository;
    private final PatientQueueRepository queueRepository;
    private final NotificationService notificationService;

    public List<AppointmentDTO> getAllAppointments() {
        Long clinicId = SecurityUtils.getCurrentClinicId();
        if (clinicId != null) {
            return appointmentRepository.findByClinic_ClinicId(clinicId).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        return appointmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctor_DoctorIdOrderByScheduledAtAsc(doctorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatient_PatientIdOrderByScheduledAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Long id) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return mapToDTO(apt);
    }

    /**
     * Exact slot generation based on doctor's schedule, breaks, consultation duration,
     * past times for today, and existing active bookings.
     */
    public List<SlotDTO> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));

        List<SlotDTO> slots = new ArrayList<>();

        // If date is before today, no slots available
        if (date.isBefore(LocalDate.now())) {
            return slots;
        }

        // Check if doctor is OFF_DUTY
        if (doctor.getAvailability() == Doctor.Availability.OFF_DUTY) {
            return slots;
        }

        // Check if date is in doctor's configured working days
        String dayName = date.getDayOfWeek().name();
        String workingDays = doctor.getWorkingDays() != null ? doctor.getWorkingDays() : "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY";
        if (!Arrays.asList(workingDays.split(",")).contains(dayName)) {
            return slots; // Doctor off-duty on this day
        }

        LocalTime startTime = doctor.getWorkingStartTime() != null ? doctor.getWorkingStartTime() : LocalTime.of(9, 0);
        LocalTime endTime = doctor.getWorkingEndTime() != null ? doctor.getWorkingEndTime() : LocalTime.of(17, 0);
        LocalTime breakStart = doctor.getBreakStartTime() != null ? doctor.getBreakStartTime() : LocalTime.of(13, 0);
        LocalTime breakEnd = doctor.getBreakEndTime() != null ? doctor.getBreakEndTime() : LocalTime.of(14, 0);
        int duration = doctor.getConsultationDuration() != null && doctor.getConsultationDuration() > 0 ? doctor.getConsultationDuration() : 15;

        // Fetch all active appointments for this doctor on this day
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(LocalTime.MAX);
        List<Appointment> bookedAppointments = appointmentRepository.findByDoctor_DoctorIdAndScheduledAtBetweenAndStatusNotInOrderByScheduledAtAsc(
                doctorId, dayStart, dayEnd, List.of(Appointment.AppointmentStatus.CANCELLED, Appointment.AppointmentStatus.RESCHEDULED, Appointment.AppointmentStatus.NO_SHOW));

        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
        DateTimeFormatter displayFmt = DateTimeFormatter.ofPattern("hh:mm a");

        LocalTime current = startTime;
        LocalTime nowTime = LocalTime.now();
        boolean isToday = date.equals(LocalDate.now());

        while (current.plusMinutes(duration).isBefore(endTime) || current.plusMinutes(duration).equals(endTime)) {
            LocalTime slotEnd = current.plusMinutes(duration);

            boolean isBreak = (current.isBefore(breakEnd) && slotEnd.isAfter(breakStart));
            boolean isPast = isToday && current.isBefore(nowTime);

            // Check if slot overlaps with any active appointment
            final LocalTime slotStart = current;
            boolean isBooked = bookedAppointments.stream().anyMatch(a -> {
                LocalTime apptTime = a.getScheduledAt().toLocalTime();
                return apptTime.equals(slotStart);
            });

            String status;
            boolean available;

            if (isBreak) {
                status = "BREAK";
                available = false;
            } else if (isPast) {
                status = "PAST";
                available = false;
            } else if (isBooked) {
                status = "BOOKED";
                available = false;
            } else {
                status = "AVAILABLE";
                available = true;
            }

            slots.add(SlotDTO.builder()
                    .time(current.format(timeFmt))
                    .displayTime(current.format(displayFmt))
                    .endTime(slotEnd.format(timeFmt))
                    .displayEndTime(slotEnd.format(displayFmt))
                    .status(status)
                    .available(available)
                    .fee(doctor.getConsultationFee())
                    .durationMinutes(duration)
                    .build());

            current = slotEnd;
        }

        return slots;
    }

    /**
     * Concurrency-safe appointment booking.
     * Prevents double-booking at the backend level.
     */
    @Transactional
    public synchronized AppointmentDTO createAppointment(AppointmentDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + dto.getDoctorId()));

        LocalDateTime scheduledAt = dto.getScheduledAt();

        // Concurrency / double-booking check
        boolean exists = appointmentRepository.existsByDoctor_DoctorIdAndScheduledAtAndStatusNotIn(
                doctor.getDoctorId(), scheduledAt,
                List.of(Appointment.AppointmentStatus.CANCELLED, Appointment.AppointmentStatus.RESCHEDULED, Appointment.AppointmentStatus.NO_SHOW));

        if (exists) {
            throw new DuplicateResourceException("Appointment slot at " + scheduledAt.format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) +
                    " is no longer available. Please select another slot.");
        }

        int duration = doctor.getConsultationDuration() != null ? doctor.getConsultationDuration() : 15;

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .scheduledAt(scheduledAt)
                .durationMinutes(duration)
                .consultationFee(doctor.getConsultationFee())
                .clinicHospital(doctor.getClinicHospital())
                .type(dto.getType() != null ? dto.getType() : Appointment.AppointmentType.SCHEDULED)
                .status(Appointment.AppointmentStatus.CONFIRMED)
                .notes(dto.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Send confirmation notification
        String msg = String.format("Appointment confirmed with Dr. %s on %s at %s. Clinic: %s.",
                doctor.getUser() != null ? doctor.getUser().getName() : "Doctor",
                scheduledAt.format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                scheduledAt.format(DateTimeFormatter.ofPattern("hh:mm a")),
                doctor.getClinicHospital());

        notificationService.createNotification(patient, msg, Notification.NotificationType.APPOINTMENT_CONFIRMED);

        return mapToDTO(saved);
    }

    /**
     * Reschedules an appointment to a new slot with full backend validation & slot availability check.
     */
    @Transactional
    public synchronized AppointmentDTO rescheduleAppointment(Long appointmentId, LocalDateTime newScheduledAt, String reason) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        if (apt.getStatus() == Appointment.AppointmentStatus.COMPLETED || apt.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot reschedule a " + apt.getStatus().name() + " appointment.");
        }

        // Verify slot is available
        boolean conflict = appointmentRepository.existsByDoctor_DoctorIdAndScheduledAtAndAppointmentIdNotAndStatusNotIn(
                apt.getDoctor().getDoctorId(), newScheduledAt, appointmentId,
                List.of(Appointment.AppointmentStatus.CANCELLED, Appointment.AppointmentStatus.RESCHEDULED, Appointment.AppointmentStatus.NO_SHOW));

        if (conflict) {
            throw new DuplicateResourceException("The selected slot is already booked. Please choose a different time.");
        }

        LocalDateTime oldTime = apt.getScheduledAt();
        apt.setScheduledAt(newScheduledAt);
        apt.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        if (reason != null && !reason.isBlank()) {
            apt.setNotes((apt.getNotes() != null ? apt.getNotes() + " | " : "") + "Rescheduled from " + oldTime + ". Reason: " + reason);
        }

        Appointment saved = appointmentRepository.save(apt);

        String msg = String.format("Your appointment with Dr. %s has been rescheduled to %s at %s.",
                apt.getDoctor().getUser() != null ? apt.getDoctor().getUser().getName() : "Doctor",
                newScheduledAt.format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                newScheduledAt.format(DateTimeFormatter.ofPattern("hh:mm a")));

        notificationService.createNotification(apt.getPatient(), msg, Notification.NotificationType.APPOINTMENT_RESCHEDULED);

        return mapToDTO(saved);
    }

    /**
     * Cancels an appointment, releases slot, updates any linked queue entry.
     */
    @Transactional
    public AppointmentDTO cancelAppointment(Long appointmentId, String reason) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        if (apt.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel an already completed appointment.");
        }

        apt.setStatus(Appointment.AppointmentStatus.CANCELLED);
        if (reason != null && !reason.isBlank()) {
            apt.setNotes((apt.getNotes() != null ? apt.getNotes() + " | " : "") + "Cancelled: " + reason);
        }
        Appointment saved = appointmentRepository.save(apt);

        // Cancel linked visits/queue if checked in
        visitRepository.findByPatient_PatientId(apt.getPatient().getPatientId()).stream()
                .filter(v -> v.getAppointment() != null && v.getAppointment().getAppointmentId().equals(appointmentId))
                .forEach(v -> {
                    v.setStatus(Visit.VisitStatus.CANCELLED);
                    visitRepository.save(v);
                    queueRepository.findByVisit_VisitId(v.getVisitId()).ifPresent(q -> {
                        q.setQueueStatus(PatientQueue.QueueStatus.CANCELLED);
                        queueRepository.save(q);
                    });
                });

        String msg = String.format("Your appointment with Dr. %s scheduled for %s has been cancelled.",
                apt.getDoctor().getUser() != null ? apt.getDoctor().getUser().getName() : "Doctor",
                apt.getScheduledAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")));

        notificationService.createNotification(apt.getPatient(), msg, Notification.NotificationType.APPOINTMENT_CANCELLED);

        return mapToDTO(saved);
    }

    /**
     * Patient arrives and checks in: transitions appointment to CHECKED_IN,
     * creates Visit and PatientQueue record with next live token.
     */
    @Transactional
    public AppointmentDTO checkInAppointment(Long appointmentId) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        if (apt.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot check in for a cancelled appointment.");
        }
        if (apt.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Appointment is already completed.");
        }

        // If already checked in, return current state
        if (apt.getStatus() == Appointment.AppointmentStatus.CHECKED_IN || apt.getStatus() == Appointment.AppointmentStatus.WAITING) {
            return mapToDTO(apt);
        }

        apt.setStatus(Appointment.AppointmentStatus.CHECKED_IN);
        Appointment saved = appointmentRepository.save(apt);

        // Create Visit & Queue Entry
        Visit visit = Visit.builder()
                .patient(apt.getPatient())
                .doctor(apt.getDoctor())
                .appointment(saved)
                .visitDate(LocalDate.now())
                .visitType(Visit.VisitType.APPOINTMENT)
                .status(Visit.VisitStatus.CHECKED_IN)
                .checkInTime(LocalDateTime.now())
                .build();
        visit = visitRepository.save(visit);

        Integer maxToken = queueRepository.findMaxTokenNumberForDoctorToday(apt.getDoctor().getDoctorId());
        int nextToken = (maxToken != null ? maxToken : 0) + 1;

        Long waitingCount = queueRepository.countWaitingByDoctor(apt.getDoctor().getDoctorId());
        int duration = apt.getDoctor().getConsultationDuration() != null ? apt.getDoctor().getConsultationDuration() : 15;
        int delay = apt.getDoctor().getCurrentDelayMinutes() != null ? apt.getDoctor().getCurrentDelayMinutes() : 0;
        int estimatedMinutes = (int) ((waitingCount != null ? waitingCount : 0) * duration) + delay;

        PatientQueue queueEntry = PatientQueue.builder()
                .visit(visit)
                .doctor(apt.getDoctor())
                .tokenNumber(nextToken)
                .priorityLevel(PatientQueue.PriorityLevel.NORMAL)
                .queueStatus(PatientQueue.QueueStatus.WAITING)
                .joinedAt(LocalDateTime.now())
                .estimatedWaitMinutes(Math.max(5, estimatedMinutes))
                .build();

        queueRepository.save(queueEntry);

        String msg = String.format("Check-in successful! Your Queue Token is #%d with Dr. %s. Estimated waiting: %d mins.",
                nextToken,
                apt.getDoctor().getUser() != null ? apt.getDoctor().getUser().getName() : "Doctor",
                Math.max(5, estimatedMinutes));

        notificationService.createNotification(apt.getPatient(), msg, Notification.NotificationType.CHECKED_IN);

        return mapToDTO(saved);
    }

    @Transactional
    public AppointmentDTO updateStatus(Long appointmentId, Appointment.AppointmentStatus status) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));
        apt.setStatus(status);
        return mapToDTO(appointmentRepository.save(apt));
    }

    public AppointmentDTO mapToDTO(Appointment a) {
        AppointmentDTO dto = AppointmentDTO.builder()
                .appointmentId(a.getAppointmentId())
                .patientId(a.getPatient().getPatientId())
                .patientName(a.getPatient().getUser() != null ? a.getPatient().getUser().getName() : "")
                .patientPhone(a.getPatient().getUser() != null ? a.getPatient().getUser().getPhone() : "")
                .doctorId(a.getDoctor().getDoctorId())
                .doctorName(a.getDoctor().getUser() != null ? a.getDoctor().getUser().getName() : "")
                .doctorSpecialty(a.getDoctor().getSpecialty())
                .doctorQualification(a.getDoctor().getQualification())
                .scheduledAt(a.getScheduledAt())
                .durationMinutes(a.getDurationMinutes() != null ? a.getDurationMinutes() : 15)
                .consultationFee(a.getConsultationFee() != null ? a.getConsultationFee() : a.getDoctor().getConsultationFee())
                .clinicHospital(a.getClinicHospital() != null ? a.getClinicHospital() : a.getDoctor().getClinicHospital())
                .type(a.getType())
                .status(a.getStatus())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();

        // Enriched live queue state if appointment is today or checked in
        try {
            visitRepository.findByPatient_PatientId(a.getPatient().getPatientId()).stream()
                    .filter(v -> v.getAppointment() != null && v.getAppointment().getAppointmentId().equals(a.getAppointmentId()))
                    .findFirst()
                    .ifPresent(v -> {
                        dto.setCheckInTime(v.getCheckInTime());
                        queueRepository.findByVisit_VisitId(v.getVisitId()).ifPresent(q -> {
                            dto.setTokenNumber(q.getTokenNumber());
                            if (q.getQueueStatus() == PatientQueue.QueueStatus.WAITING) {
                                long ahead = queueRepository.findByDoctor_DoctorIdOrderByTokenNumberAsc(q.getDoctor().getDoctorId()).stream()
                                        .filter(item -> item.getQueueStatus() == PatientQueue.QueueStatus.WAITING && item.getTokenNumber() < q.getTokenNumber())
                                        .count();
                                dto.setPatientsAhead((int) ahead);
                                dto.setQueuePosition((int) ahead + 1);
                                int dur = q.getDoctor().getConsultationDuration() != null ? q.getDoctor().getConsultationDuration() : 15;
                                int delay = q.getDoctor().getCurrentDelayMinutes() != null ? q.getDoctor().getCurrentDelayMinutes() : 0;
                                dto.setEstimatedWaitMinutes((int) (ahead * dur) + delay);
                            } else if (q.getQueueStatus() == PatientQueue.QueueStatus.IN_CONSULTATION) {
                                dto.setPatientsAhead(0);
                                dto.setQueuePosition(0);
                                dto.setEstimatedWaitMinutes(0);
                            }
                        });
                    });
        } catch (Exception ignored) {
        }

        return dto;
    }
}
