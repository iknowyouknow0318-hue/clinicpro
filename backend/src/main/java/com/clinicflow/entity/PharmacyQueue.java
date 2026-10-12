package com.clinicflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pharmacy_queue")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pharmacyQueueId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacy_order_id", nullable = false, unique = true)
    private PharmacyOrder pharmacyOrder;

    @Column(name = "queue_position", nullable = false)
    private Integer queuePosition;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "estimated_processing_minutes")
    private Integer estimatedProcessingMinutes;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PharmacyQueueStatus status = PharmacyQueueStatus.WAITING;

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

    public enum PharmacyQueueStatus {
        WAITING, PROCESSING, READY, COLLECTED
    }
}
