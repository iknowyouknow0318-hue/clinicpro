package com.clinicflow.repository;

import com.clinicflow.entity.PatientQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientQueueRepository extends JpaRepository<PatientQueue, Long> {
    List<PatientQueue> findByDoctor_DoctorIdAndQueueStatusOrderByTokenNumberAsc(Long doctorId, PatientQueue.QueueStatus status);
    List<PatientQueue> findByDoctor_DoctorIdOrderByTokenNumberAsc(Long doctorId);
    Optional<PatientQueue> findByVisit_VisitId(Long visitId);

    @Query("SELECT COALESCE(MAX(pq.tokenNumber), 0) FROM PatientQueue pq WHERE pq.doctor.doctorId = :doctorId " +
           "AND FUNCTION('DATE', pq.joinedAt) = CURRENT_DATE")
    Integer findMaxTokenNumberForDoctorToday(Long doctorId);

    @Query("SELECT COUNT(pq) FROM PatientQueue pq WHERE pq.doctor.doctorId = :doctorId " +
           "AND pq.queueStatus = 'WAITING'")
    Long countWaitingByDoctor(Long doctorId);

    @Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, pq.joinedAt, pq.calledAt)) FROM PatientQueue pq " +
           "WHERE pq.doctor.doctorId = :doctorId AND pq.calledAt IS NOT NULL " +
           "AND FUNCTION('DATE', pq.joinedAt) = CURRENT_DATE")
    Double findAverageWaitTimeForDoctorToday(Long doctorId);
}
