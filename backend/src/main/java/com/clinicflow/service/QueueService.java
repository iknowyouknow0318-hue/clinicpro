package com.clinicflow.service;

import com.clinicflow.dto.CheckInRequest;
import com.clinicflow.dto.QueueEntryDTO;
import com.clinicflow.entity.*;
import com.clinicflow.exception.BadRequestException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueueService {

    private final PatientQueueRepository queueRepository;
    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    @Transactional
    public QueueEntryDTO checkInAndJoinQueue(CheckInRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + request.getPatientId()));
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + request.getDoctorId()));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
            if (appointment != null) {
                appointment.setStatus(Appointment.AppointmentStatus.CHECKED_IN);
                appointmentRepository.save(appointment);
            }
        }

        // Create Visit
        Visit visit = Visit.builder()
                .patient(patient)
                .doctor(doctor)
                .appointment(appointment)
                .visitDate(LocalDate.now())
                .visitType(request.getVisitType() != null ? request.getVisitType() : Visit.VisitType.WALK_IN)
                .status(Visit.VisitStatus.CHECKED_IN)
                .checkInTime(LocalDateTime.now())
                .build();
        visit = visitRepository.save(visit);

        // Next token number for doctor
        Integer maxToken = queueRepository.findMaxTokenNumberForDoctorToday(doctor.getDoctorId());
        int nextToken = (maxToken != null ? maxToken : 0) + 1;

        // Dynamic estimated waiting time
        Long waitingCount = queueRepository.countWaitingByDoctor(doctor.getDoctorId());
        int duration = doctor.getConsultationDuration() != null ? doctor.getConsultationDuration() : 15;
        int delay = doctor.getCurrentDelayMinutes() != null ? doctor.getCurrentDelayMinutes() : 0;
        int estimatedMinutes = (int) ((waitingCount != null ? waitingCount : 0) * duration) + delay;

        PatientQueue queueEntry = PatientQueue.builder()
                .visit(visit)
                .doctor(doctor)
                .tokenNumber(nextToken)
                .priorityLevel(request.getPriorityLevel() != null ? request.getPriorityLevel() : PatientQueue.PriorityLevel.NORMAL)
                .queueStatus(PatientQueue.QueueStatus.WAITING)
                .joinedAt(LocalDateTime.now())
                .estimatedWaitMinutes(Math.max(5, estimatedMinutes))
                .build();

        PatientQueue saved = queueRepository.save(queueEntry);

        // Send check-in notification
        notificationService.createNotification(patient,
                String.format("Checked in! Token #%d with Dr. %s. Estimated wait: %d mins.",
                        nextToken,
                        doctor.getUser() != null ? doctor.getUser().getName() : "Doctor",
                        Math.max(5, estimatedMinutes)),
                Notification.NotificationType.CHECKED_IN);

        return mapToDTO(saved, waitingCount != null ? waitingCount.intValue() : 0);
    }

    public List<QueueEntryDTO> getQueueForDoctor(Long doctorId) {
        List<PatientQueue> list = queueRepository.findByDoctor_DoctorIdOrderByTokenNumberAsc(doctorId);
        return list.stream()
                .map(entry -> mapToDTO(entry, calculatePatientsAhead(entry)))
                .collect(Collectors.toList());
    }

    public List<QueueEntryDTO> getActiveQueueForDoctor(Long doctorId) {
        List<PatientQueue> list = queueRepository.findByDoctor_DoctorIdAndQueueStatusOrderByTokenNumberAsc(
                doctorId, PatientQueue.QueueStatus.WAITING);
        return list.stream()
                .map(entry -> mapToDTO(entry, calculatePatientsAhead(entry)))
                .collect(Collectors.toList());
    }

    /**
     * Privacy-preserving public queue display.
     * Mask patient names to 'Token #X' or 'Patient #X' without disclosing phone/email/records.
     */
    public List<QueueEntryDTO> getPublicQueueForDoctor(Long doctorId) {
        List<PatientQueue> list = queueRepository.findByDoctor_DoctorIdOrderByTokenNumberAsc(doctorId);
        return list.stream()
                .map(entry -> {
                    QueueEntryDTO dto = mapToDTO(entry, calculatePatientsAhead(entry));
                    dto.setPatientName("Patient #" + String.format("%02d", entry.getTokenNumber()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<QueueEntryDTO> getAllQueueEntries() {
        return queueRepository.findAll().stream()
                .map(entry -> mapToDTO(entry, calculatePatientsAhead(entry)))
                .collect(Collectors.toList());
    }

    public QueueEntryDTO getQueueEntryById(Long id) {
        PatientQueue entry = queueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found: " + id));
        return mapToDTO(entry, calculatePatientsAhead(entry));
    }

    public QueueEntryDTO getQueueEntryByVisitId(Long visitId) {
        PatientQueue entry = queueRepository.findByVisit_VisitId(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found for visit: " + visitId));
        return mapToDTO(entry, calculatePatientsAhead(entry));
    }

    public QueueEntryDTO getQueueForPatient(Long patientId) {
        return queueRepository.findAll().stream()
                .filter(q -> q.getVisit() != null &&
                        q.getVisit().getPatient() != null &&
                        q.getVisit().getPatient().getPatientId().equals(patientId) &&
                        q.getQueueStatus() != PatientQueue.QueueStatus.COMPLETED &&
                        q.getQueueStatus() != PatientQueue.QueueStatus.CANCELLED)
                .findFirst()
                .map(entry -> mapToDTO(entry, calculatePatientsAhead(entry)))
                .orElse(null);
    }

    @Transactional
    public QueueEntryDTO startConsultation(Long queueEntryId) {
        PatientQueue entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found: " + queueEntryId));

        entry.setQueueStatus(PatientQueue.QueueStatus.IN_CONSULTATION);
        if (entry.getCalledAt() == null) {
            entry.setCalledAt(LocalDateTime.now());
        }
        entry.getVisit().setStatus(Visit.VisitStatus.IN_CONSULTATION);
        visitRepository.save(entry.getVisit());

        if (entry.getVisit().getAppointment() != null) {
            Appointment apt = entry.getVisit().getAppointment();
            apt.setStatus(Appointment.AppointmentStatus.CONSULTING);
            appointmentRepository.save(apt);
        }

        PatientQueue saved = queueRepository.save(entry);

        // Notify patient
        notificationService.createNotification(entry.getVisit().getPatient(),
                String.format("Dr. %s has started your consultation. Please enter the consultation room.",
                        entry.getDoctor().getUser() != null ? entry.getDoctor().getUser().getName() : "Doctor"),
                Notification.NotificationType.CONSULTATION_STARTED);

        // Check if next waiting patient should be alerted that their turn is approaching
        notifyNextWaitingPatient(entry.getDoctor().getDoctorId());

        return mapToDTO(saved, 0);
    }

    @Transactional
    public QueueEntryDTO completeConsultation(Long queueEntryId) {
        PatientQueue entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found: " + queueEntryId));

        entry.setQueueStatus(PatientQueue.QueueStatus.COMPLETED);
        entry.getVisit().setStatus(Visit.VisitStatus.COMPLETED);
        entry.getVisit().setCompletedAt(LocalDateTime.now());
        visitRepository.save(entry.getVisit());

        if (entry.getVisit().getAppointment() != null) {
            Appointment apt = entry.getVisit().getAppointment();
            apt.setStatus(Appointment.AppointmentStatus.COMPLETED);
            appointmentRepository.save(apt);
        }

        PatientQueue saved = queueRepository.save(entry);

        // Notify patient
        notificationService.createNotification(entry.getVisit().getPatient(),
                String.format("Your consultation with Dr. %s is complete. Proceed to pharmacy if medicines were prescribed.",
                        entry.getDoctor().getUser() != null ? entry.getDoctor().getUser().getName() : "Doctor"),
                Notification.NotificationType.CONSULTATION_COMPLETED);

        // Auto call or alert next patient in queue
        notifyNextWaitingPatient(entry.getDoctor().getDoctorId());

        return mapToDTO(saved, 0);
    }

    @Transactional
    public QueueEntryDTO markNoShow(Long queueEntryId) {
        PatientQueue entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found: " + queueEntryId));

        entry.setQueueStatus(PatientQueue.QueueStatus.CANCELLED);
        entry.getVisit().setStatus(Visit.VisitStatus.CANCELLED);
        visitRepository.save(entry.getVisit());

        if (entry.getVisit().getAppointment() != null) {
            Appointment apt = entry.getVisit().getAppointment();
            apt.setStatus(Appointment.AppointmentStatus.NO_SHOW);
            appointmentRepository.save(apt);
        }

        PatientQueue saved = queueRepository.save(entry);

        // Notify next waiting patient
        notifyNextWaitingPatient(entry.getDoctor().getDoctorId());

        return mapToDTO(saved, 0);
    }

    @Transactional
    public QueueEntryDTO callNextPatient(Long doctorId) {
        List<PatientQueue> waitingList = queueRepository.findByDoctor_DoctorIdAndQueueStatusOrderByTokenNumberAsc(
                doctorId, PatientQueue.QueueStatus.WAITING);

        if (waitingList.isEmpty()) {
            throw new BadRequestException("No patients currently waiting in queue.");
        }

        PatientQueue next = waitingList.get(0);
        next.setQueueStatus(PatientQueue.QueueStatus.CALLED);
        next.setCalledAt(LocalDateTime.now());
        next.getVisit().setStatus(Visit.VisitStatus.IN_QUEUE);
        visitRepository.save(next.getVisit());

        PatientQueue saved = queueRepository.save(next);

        // Notify called patient
        Doctor doc = doctorRepository.findById(doctorId).orElse(null);
        String docName = (doc != null && doc.getUser() != null) ? doc.getUser().getName() : "Doctor";
        notificationService.createNotification(next.getVisit().getPatient(),
                String.format("🔔 Token #%d is now being called by Dr. %s! Please proceed to the consultation room.",
                        next.getTokenNumber(), docName),
                Notification.NotificationType.QUEUE_UPDATE);

        return mapToDTO(saved, 0);
    }

    @Transactional
    public QueueEntryDTO updateQueueStatus(Long queueEntryId, PatientQueue.QueueStatus status) {
        PatientQueue entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found: " + queueEntryId));

        entry.setQueueStatus(status);
        if (status == PatientQueue.QueueStatus.CALLED) {
            entry.setCalledAt(LocalDateTime.now());
            entry.getVisit().setStatus(Visit.VisitStatus.IN_QUEUE);
        } else if (status == PatientQueue.QueueStatus.IN_CONSULTATION) {
            entry.getVisit().setStatus(Visit.VisitStatus.IN_CONSULTATION);
            if (entry.getVisit().getAppointment() != null) {
                entry.getVisit().getAppointment().setStatus(Appointment.AppointmentStatus.CONSULTING);
                appointmentRepository.save(entry.getVisit().getAppointment());
            }
        } else if (status == PatientQueue.QueueStatus.COMPLETED) {
            entry.getVisit().setStatus(Visit.VisitStatus.COMPLETED);
            entry.getVisit().setCompletedAt(LocalDateTime.now());
            if (entry.getVisit().getAppointment() != null) {
                entry.getVisit().getAppointment().setStatus(Appointment.AppointmentStatus.COMPLETED);
                appointmentRepository.save(entry.getVisit().getAppointment());
            }
        } else if (status == PatientQueue.QueueStatus.CANCELLED) {
            entry.getVisit().setStatus(Visit.VisitStatus.CANCELLED);
        }

        visitRepository.save(entry.getVisit());
        PatientQueue saved = queueRepository.save(entry);
        return mapToDTO(saved, calculatePatientsAhead(saved));
    }

    private void notifyNextWaitingPatient(Long doctorId) {
        List<PatientQueue> waiting = queueRepository.findByDoctor_DoctorIdAndQueueStatusOrderByTokenNumberAsc(
                doctorId, PatientQueue.QueueStatus.WAITING);
        if (!waiting.isEmpty()) {
            PatientQueue firstInLine = waiting.get(0);
            Doctor doc = doctorRepository.findById(doctorId).orElse(null);
            String docName = (doc != null && doc.getUser() != null) ? doc.getUser().getName() : "Doctor";
            notificationService.createNotification(firstInLine.getVisit().getPatient(),
                    String.format("You are next in line for Dr. %s! Please be ready near the consultation room.", docName),
                    Notification.NotificationType.TURN_APPROACHING);
        }
    }

    private int calculatePatientsAhead(PatientQueue entry) {
        if (entry.getQueueStatus() != PatientQueue.QueueStatus.WAITING) {
            return 0;
        }
        return (int) queueRepository.findByDoctor_DoctorIdOrderByTokenNumberAsc(entry.getDoctor().getDoctorId()).stream()
                .filter(q -> q.getQueueStatus() == PatientQueue.QueueStatus.WAITING && q.getTokenNumber() < entry.getTokenNumber())
                .count();
    }

    public QueueEntryDTO mapToDTO(PatientQueue q, int patientsAhead) {
        int duration = q.getDoctor().getConsultationDuration() != null ? q.getDoctor().getConsultationDuration() : 15;
        int delay = q.getDoctor().getCurrentDelayMinutes() != null ? q.getDoctor().getCurrentDelayMinutes() : 0;

        // Dynamic Overrun Calculation if doctor is currently consulting someone
        int overrunMinutes = 0;
        Optional<PatientQueue> consultingNow = queueRepository.findByDoctor_DoctorIdOrderByTokenNumberAsc(q.getDoctor().getDoctorId()).stream()
                .filter(item -> item.getQueueStatus() == PatientQueue.QueueStatus.IN_CONSULTATION && item.getCalledAt() != null)
                .findFirst();

        if (consultingNow.isPresent()) {
            long elapsed = Duration.between(consultingNow.get().getCalledAt(), LocalDateTime.now()).toMinutes();
            if (elapsed > duration) {
                overrunMinutes = (int) (elapsed - duration);
            }
        }

        int dynamicWait = (patientsAhead * duration) + overrunMinutes + delay;
        if (q.getQueueStatus() == PatientQueue.QueueStatus.IN_CONSULTATION || q.getQueueStatus() == PatientQueue.QueueStatus.COMPLETED) {
            dynamicWait = 0;
        }

        return QueueEntryDTO.builder()
                .queueEntryId(q.getQueueEntryId())
                .visitId(q.getVisit().getVisitId())
                .patientId(q.getVisit().getPatient().getPatientId())
                .patientName(q.getVisit().getPatient().getUser() != null ? q.getVisit().getPatient().getUser().getName() : "")
                .doctorId(q.getDoctor().getDoctorId())
                .doctorName(q.getDoctor().getUser() != null ? q.getDoctor().getUser().getName() : "")
                .tokenNumber(q.getTokenNumber())
                .priorityLevel(q.getPriorityLevel())
                .queueStatus(q.getQueueStatus())
                .joinedAt(q.getJoinedAt())
                .calledAt(q.getCalledAt())
                .estimatedWaitMinutes(Math.max(0, dynamicWait))
                .patientsAhead(patientsAhead)
                .build();
    }
}
