package com.clinicflow.repository;

import com.clinicflow.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByPatient_PatientIdOrderByCreatedAtDesc(Long patientId);
    List<Notification> findByPatient_PatientIdAndStatus(Long patientId, Notification.NotificationStatus status);
    Long countByPatient_PatientIdAndStatus(Long patientId, Notification.NotificationStatus status);
}
