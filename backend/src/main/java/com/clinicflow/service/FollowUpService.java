package com.clinicflow.service;

import com.clinicflow.dto.FollowUpDTO;
import com.clinicflow.entity.FollowUp;
import com.clinicflow.entity.Patient;
import com.clinicflow.entity.Visit;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.FollowUpRepository;
import com.clinicflow.repository.PatientRepository;
import com.clinicflow.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;

    public List<FollowUpDTO> getAllFollowUps() {
        return followUpRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<FollowUpDTO> getFollowUpsByPatient(Long patientId) {
        return followUpRepository.findByPatient_PatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FollowUpDTO scheduleFollowUp(FollowUpDTO dto) {
        Visit visit = visitRepository.findById(dto.getVisitId())
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + dto.getVisitId()));
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + dto.getPatientId()));

        FollowUp followUp = FollowUp.builder()
                .visit(visit)
                .patient(patient)
                .scheduledDate(dto.getScheduledDate())
                .reason(dto.getReason())
                .status(FollowUp.FollowUpStatus.SCHEDULED)
                .build();

        FollowUp saved = followUpRepository.save(followUp);
        return mapToDTO(saved);
    }

    @Transactional
    public FollowUpDTO updateStatus(Long followUpId, FollowUp.FollowUpStatus status) {
        FollowUp followUp = followUpRepository.findById(followUpId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow up not found: " + followUpId));
        followUp.setStatus(status);
        if (status == FollowUp.FollowUpStatus.COMPLETED) {
            followUp.setCompletedAt(LocalDateTime.now());
        }
        return mapToDTO(followUpRepository.save(followUp));
    }

    public FollowUpDTO mapToDTO(FollowUp f) {
        return FollowUpDTO.builder()
                .followUpId(f.getFollowUpId())
                .visitId(f.getVisit().getVisitId())
                .patientId(f.getPatient().getPatientId())
                .patientName(f.getPatient().getUser() != null ? f.getPatient().getUser().getName() : "")
                .scheduledDate(f.getScheduledDate())
                .reason(f.getReason())
                .status(f.getStatus())
                .completedAt(f.getCompletedAt())
                .build();
    }
}
