package com.clinicflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescription_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long prescriptionItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false, length = 100)
    private String dosage;

    @Column(nullable = false, length = 100)
    private String frequency;

    @Column(length = 200)
    private String timing; // e.g. "Morning (After Food), Night (After Food)"

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "prescribed_quantity")
    private Integer prescribedQuantity;

    @Column(name = "dispensed_quantity", nullable = false)
    @Builder.Default
    private Integer dispensedQuantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (prescribedQuantity == null) {
            prescribedQuantity = quantity;
        }
        if (dispensedQuantity == null) {
            dispensedQuantity = 0;
        }
        if (reservedQuantity == null) {
            reservedQuantity = 0;
        }
    }
}
