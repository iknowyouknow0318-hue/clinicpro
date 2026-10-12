package com.clinicflow.repository;

import com.clinicflow.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Optional<Prescription> findByConsultation_ConsultationId(Long consultationId);
    List<Prescription> findByConsultation_ConsultationIdOrderByVersionDesc(Long consultationId);
    List<Prescription> findByPatient_PatientId(Long patientId);
    List<Prescription> findByPatient_PatientIdAndIsLatestActiveTrue(Long patientId);
    List<Prescription> findByPatient_PatientIdOrderByIssuedAtDesc(Long patientId);
    List<Prescription> findByDoctor_DoctorId(Long doctorId);
    List<Prescription> findByStatus(Prescription.PrescriptionStatus status);
}
