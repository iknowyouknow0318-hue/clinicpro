package com.clinicflow.service;

import com.clinicflow.dto.ConsultationDTO;
import com.clinicflow.entity.Consultation;
import com.clinicflow.entity.PatientQueue;
import com.clinicflow.entity.Visit;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.ConsultationRepository;
import com.clinicflow.repository.PatientQueueRepository;
import com.clinicflow.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final VisitRepository visitRepository;
    private final PatientQueueRepository queueRepository;

    @Transactional
    public ConsultationDTO startConsultation(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + visitId));

        Optional<Consultation> existing = consultationRepository.findByVisit_VisitId(visitId);
        if (existing.isPresent()) {
            return mapToDTO(existing.get());
        }

        Consultation consultation = Consultation.builder()
                .visit(visit)
                .patient(visit.getPatient())
                .doctor(visit.getDoctor())
                .startedAt(LocalDateTime.now())
                .status(Consultation.ConsultationStatus.IN_PROGRESS)
                .build();

        Consultation saved = consultationRepository.save(consultation);

        // Update queue status to IN_CONSULTATION
        queueRepository.findByVisit_VisitId(visitId).ifPresent(q -> {
            q.setQueueStatus(PatientQueue.QueueStatus.IN_CONSULTATION);
            queueRepository.save(q);
        });

        visit.setStatus(Visit.VisitStatus.IN_CONSULTATION);
        visitRepository.save(visit);

        return mapToDTO(saved);
    }

    @Transactional
    public ConsultationDTO saveConsultation(ConsultationDTO dto) {
        Consultation consultation = consultationRepository.findById(dto.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found: " + dto.getConsultationId()));

        consultation.setSymptoms(dto.getSymptoms());
        consultation.setDiagnosisNotes(dto.getDiagnosisNotes());
        consultation.setClinicalNotes(dto.getClinicalNotes());

        if (dto.getStatus() != null) {
            consultation.setStatus(dto.getStatus());
            if (dto.getStatus() == Consultation.ConsultationStatus.COMPLETED) {
                consultation.setEndedAt(LocalDateTime.now());
                consultation.getVisit().setStatus(Visit.VisitStatus.COMPLETED);
                consultation.getVisit().setCompletedAt(LocalDateTime.now());
                visitRepository.save(consultation.getVisit());

                // Complete queue
                queueRepository.findByVisit_VisitId(consultation.getVisit().getVisitId()).ifPresent(q -> {
                    q.setQueueStatus(PatientQueue.QueueStatus.COMPLETED);
                    queueRepository.save(q);
                });
            }
        }

        Consultation saved = consultationRepository.save(consultation);
        return mapToDTO(saved);
    }

    public ConsultationDTO getConsultationById(Long id) {
        Consultation c = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found: " + id));
        return mapToDTO(c);
    }

    public ConsultationDTO getConsultationByVisitId(Long visitId) {
        Consultation c = consultationRepository.findByVisit_VisitId(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found for visit: " + visitId));
        return mapToDTO(c);
    }

    public List<ConsultationDTO> getConsultationsByPatient(Long patientId) {
        return consultationRepository.findByPatient_PatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ConsultationDTO mapToDTO(Consultation c) {
        return ConsultationDTO.builder()
                .consultationId(c.getConsultationId())
                .visitId(c.getVisit().getVisitId())
                .patientId(c.getPatient().getPatientId())
                .patientName(c.getPatient().getUser() != null ? c.getPatient().getUser().getName() : "")
                .doctorId(c.getDoctor().getDoctorId())
                .doctorName(c.getDoctor().getUser() != null ? c.getDoctor().getUser().getName() : "")
                .startedAt(c.getStartedAt())
                .endedAt(c.getEndedAt())
                .symptoms(c.getSymptoms())
                .diagnosisNotes(c.getDiagnosisNotes())
                .clinicalNotes(c.getClinicalNotes())
                .status(c.getStatus())
                .build();
    }
}
