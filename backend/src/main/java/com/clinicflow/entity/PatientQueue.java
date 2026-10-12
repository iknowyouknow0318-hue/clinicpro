package com.clinicflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_queue")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long queueEntryId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false, unique = true)
    private Visit visit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "token_number", nullable = false)
    private Integer tokenNumber;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "priority_level", nullable = false)
    private PriorityLevel priorityLevel = PriorityLevel.NORMAL;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "queue_status", nullable = false)
    private QueueStatus queueStatus = QueueStatus.WAITING;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Column(name = "estimated_wait_minutes")
    private Integer estimatedWaitMinutes;

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

    public enum PriorityLevel {
        NORMAL, PRIORITY, URGENT
    }

    public enum QueueStatus {
        WAITING, CALLED, IN_CONSULTATION, COMPLETED, CANCELLED
    }
}
