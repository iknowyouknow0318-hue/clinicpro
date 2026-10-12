package com.clinicflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pharmacy_order")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pharmacyOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;

    @Column(name = "processing_started_at")
    private LocalDateTime processingStartedAt;

    @Column(name = "ready_at")
    private LocalDateTime readyAt;

    @Column(name = "collected_at")
    private LocalDateTime collectedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.RECEIVED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = OrderStatus.RECEIVED;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum OrderStatus {
        RECEIVED, CHECKING, PROCESSING, READY, COLLECTED, DISPENSED, CANCELLED
    }
}
