package com.clinicflow.repository;

import com.clinicflow.entity.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByPatient_PatientId(Long patientId);
    List<FollowUp> findByScheduledDate(LocalDate date);
    List<FollowUp> findByStatus(FollowUp.FollowUpStatus status);
    List<FollowUp> findByScheduledDateBeforeAndStatus(LocalDate date, FollowUp.FollowUpStatus status);
}
