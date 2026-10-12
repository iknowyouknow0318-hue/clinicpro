package com.clinicflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status = NotificationStatus.UNREAD;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum NotificationType {
        APPOINTMENT_BOOKED, APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED,
        CHECKED_IN, CONSULTATION_STARTED, TURN_APPROACHING, CONSULTATION_COMPLETED, DOCTOR_DELAYED,
        QUEUE_UPDATE, PHARMACY_READY, FOLLOW_UP_REMINDER, APPOINTMENT_REMINDER, GENERAL
    }

    public enum NotificationStatus {
        UNREAD, READ, DISMISSED
    }
}
