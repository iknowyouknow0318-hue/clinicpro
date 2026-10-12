package com.clinicflow.service;

import com.clinicflow.dto.DoctorDTO;
import com.clinicflow.dto.DoctorScheduleDTO;
import com.clinicflow.entity.Doctor;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.DoctorRepository;
import com.clinicflow.repository.PatientQueueRepository;
import com.clinicflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PatientQueueRepository queueRepository;

    public List<DoctorDTO> getAllDoctors() {
        Long clinicId = SecurityUtils.getCurrentClinicId();
        if (clinicId != null) {
            return doctorRepository.findByClinic_ClinicId(clinicId).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        return doctorRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DoctorDTO getDoctorById(Long id) {
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return mapToDTO(doc);
    }

    public DoctorDTO getDoctorByUserId(Long userId) {
        Doctor doc = doctorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for user id: " + userId));
        return mapToDTO(doc);
    }

    @Transactional
    public DoctorDTO updateAvailability(Long doctorId, Doctor.Availability availability) {
        Doctor doc = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        doc.setAvailability(availability);
        return mapToDTO(doctorRepository.save(doc));
    }

    @Transactional
    public DoctorDTO updateSchedule(Long doctorId, DoctorScheduleDTO dto) {
        Doctor doc = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (dto.getWorkingDays() != null) doc.setWorkingDays(dto.getWorkingDays());
        if (dto.getWorkingStartTime() != null) doc.setWorkingStartTime(dto.getWorkingStartTime());
        if (dto.getWorkingEndTime() != null) doc.setWorkingEndTime(dto.getWorkingEndTime());
        if (dto.getBreakStartTime() != null) doc.setBreakStartTime(dto.getBreakStartTime());
        if (dto.getBreakEndTime() != null) doc.setBreakEndTime(dto.getBreakEndTime());
        if (dto.getConsultationDuration() != null && dto.getConsultationDuration() > 0) {
            doc.setConsultationDuration(dto.getConsultationDuration());
        }
        if (dto.getConsultationFee() != null && dto.getConsultationFee().compareTo(BigDecimal.ZERO) >= 0) {
            doc.setConsultationFee(dto.getConsultationFee());
        }
        if (dto.getCurrentDelayMinutes() != null) {
            doc.setCurrentDelayMinutes(Math.max(0, dto.getCurrentDelayMinutes()));
        }
        if (dto.getAvailability() != null) {
            doc.setAvailability(dto.getAvailability());
        }

        return mapToDTO(doctorRepository.save(doc));
    }

    @Transactional
    public DoctorDTO updateDelay(Long doctorId, Integer delayMinutes) {
        Doctor doc = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        doc.setCurrentDelayMinutes(Math.max(0, delayMinutes != null ? delayMinutes : 0));
        return mapToDTO(doctorRepository.save(doc));
    }

    public List<DoctorDTO> searchDoctors(String query, String specialty, String clinic, String location,
                                         BigDecimal maxFee, Doctor.Availability availability) {
        return doctorRepository.findAll().stream()
                .filter(d -> {
                    if (query != null && !query.isBlank()) {
                        String q = query.toLowerCase();
                        String name = d.getUser() != null ? d.getUser().getName().toLowerCase() : "";
                        String spec = d.getSpecialty() != null ? d.getSpecialty().toLowerCase() : "";
                        String hosp = d.getClinicHospital() != null ? d.getClinicHospital().toLowerCase() : "";
                        if (!name.contains(q) && !spec.contains(q) && !hosp.contains(q)) return false;
                    }
                    if (specialty != null && !specialty.isBlank() && !specialty.equalsIgnoreCase("ALL")) {
                        if (d.getSpecialty() == null || !d.getSpecialty().equalsIgnoreCase(specialty)) return false;
                    }
                    if (clinic != null && !clinic.isBlank()) {
                        if (d.getClinicHospital() == null || !d.getClinicHospital().toLowerCase().contains(clinic.toLowerCase())) return false;
                    }
                    if (location != null && !location.isBlank()) {
                        if (d.getLocation() == null || !d.getLocation().toLowerCase().contains(location.toLowerCase())) return false;
                    }
                    if (maxFee != null && d.getConsultationFee() != null) {
                        if (d.getConsultationFee().compareTo(maxFee) > 0) return false;
                    }
                    if (availability != null) {
                        if (d.getAvailability() != availability) return false;
                    }
                    return true;
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DoctorDTO mapToDTO(Doctor d) {
        Long waiting = queueRepository.countWaitingByDoctor(d.getDoctorId());
        int waitingCount = waiting != null ? waiting.intValue() : 0;
        int duration = d.getConsultationDuration() != null ? d.getConsultationDuration() : 15;
        int delay = d.getCurrentDelayMinutes() != null ? d.getCurrentDelayMinutes() : 0;
        int estimatedWait = (waitingCount * duration) + delay;

        return DoctorDTO.builder()
                .doctorId(d.getDoctorId())
                .userId(d.getUser() != null ? d.getUser().getUserId() : null)
                .name(d.getUser() != null ? d.getUser().getName() : "")
                .email(d.getUser() != null ? d.getUser().getEmail() : "")
                .phone(d.getUser() != null ? d.getUser().getPhone() : "")
                .licenseNo(d.getLicenseNo())
                .specialty(d.getSpecialty())
                .qualification(d.getQualification())
                .availability(d.getAvailability())
                .experienceYears(d.getExperienceYears() != null ? d.getExperienceYears() : 5)
                .clinicHospital(d.getClinicHospital() != null ? d.getClinicHospital()
                        : (d.getClinic() != null ? d.getClinic().getClinicName() : ""))
                .location(d.getLocation() != null ? d.getLocation() : "Floor 2")
                .consultationFee(d.getConsultationFee() != null ? d.getConsultationFee() : new BigDecimal("500.00"))
                .consultationDuration(duration)
                .workingDays(d.getWorkingDays() != null ? d.getWorkingDays() : "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY")
                .workingStartTime(d.getWorkingStartTime() != null ? d.getWorkingStartTime() : java.time.LocalTime.of(9, 0))
                .workingEndTime(d.getWorkingEndTime() != null ? d.getWorkingEndTime() : java.time.LocalTime.of(17, 0))
                .breakStartTime(d.getBreakStartTime() != null ? d.getBreakStartTime() : java.time.LocalTime.of(13, 0))
                .breakEndTime(d.getBreakEndTime() != null ? d.getBreakEndTime() : java.time.LocalTime.of(14, 0))
                .currentDelayMinutes(delay)
                .photoUrl(d.getPhotoUrl())
                .currentWaitingPatients(waitingCount)
                .estimatedWaitMinutes(estimatedWait)
                .nextAvailableSlot(d.getAvailability() == Doctor.Availability.AVAILABLE ? "Today" : "Tomorrow")
                .build();
    }
}
