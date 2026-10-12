package com.clinicflow.repository;

import com.clinicflow.entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, Long> {
    Optional<Clinic> findByClinicIdentifier(String clinicIdentifier);
    boolean existsByClinicIdentifier(String clinicIdentifier);
    List<Clinic> findByStatus(Clinic.Status status);
}
