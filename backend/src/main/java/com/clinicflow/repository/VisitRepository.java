package com.clinicflow.repository;

import com.clinicflow.entity.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByPatient_PatientId(Long patientId);
    List<Visit> findByDoctor_DoctorId(Long doctorId);
    List<Visit> findByVisitDate(LocalDate visitDate);
    List<Visit> findByStatus(Visit.VisitStatus status);
    List<Visit> findByDoctor_DoctorIdAndVisitDate(Long doctorId, LocalDate visitDate);
}
