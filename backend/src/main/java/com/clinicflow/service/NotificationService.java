package com.clinicflow.service;

import com.clinicflow.dto.NotificationDTO;
import com.clinicflow.entity.Notification;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationDTO> getNotificationsForPatient(Long patientId) {
        return notificationRepository.findByPatient_PatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotificationsForPatient(Long patientId) {
        return notificationRepository.findByPatient_PatientIdAndStatus(
                patientId, Notification.NotificationStatus.UNREAD).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        n.setStatus(Notification.NotificationStatus.READ);
        return mapToDTO(notificationRepository.save(n));
    }

    @Transactional
    public NotificationDTO createNotification(com.clinicflow.entity.Patient patient, String message, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .patient(patient)
                .message(message)
                .type(type)
                .status(Notification.NotificationStatus.UNREAD)
                .build();
        return mapToDTO(notificationRepository.save(notification));
    }

    public NotificationDTO mapToDTO(Notification n) {
        return NotificationDTO.builder()
                .notificationId(n.getNotificationId())
                .patientId(n.getPatient().getPatientId())
                .message(n.getMessage())
                .type(n.getType())
                .status(n.getStatus())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
