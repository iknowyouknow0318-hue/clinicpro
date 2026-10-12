package com.clinicflow.dto;

import com.clinicflow.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long notificationId;
    private Long patientId;
    private String message;
    private Notification.NotificationType type;
    private Notification.NotificationStatus status;
    private LocalDateTime createdAt;
}
