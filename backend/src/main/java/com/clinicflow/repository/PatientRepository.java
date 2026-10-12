package com.clinicflow.repository;

import com.clinicflow.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUser_UserId(Long userId);
    Optional<Patient> findByUser_Email(String email);
    List<Patient> findByClinic_ClinicId(Long clinicId);
}
