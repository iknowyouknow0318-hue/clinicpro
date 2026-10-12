package com.clinicflow.repository;

import com.clinicflow.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    Optional<Consultation> findByVisit_VisitId(Long visitId);
    List<Consultation> findByPatient_PatientId(Long patientId);
    List<Consultation> findByDoctor_DoctorId(Long doctorId);
    List<Consultation> findByStatus(Consultation.ConsultationStatus status);
}
