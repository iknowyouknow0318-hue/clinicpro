package com.clinicflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescription")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long prescriptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PrescriptionStatus status = PrescriptionStatus.DRAFT;

    @Column(nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(name = "is_latest_active", nullable = false)
    @Builder.Default
    private Boolean isLatestActive = true;

    @Column(name = "previous_prescription_id")
    private Long previousPrescriptionId;

    @Column(name = "is_verified_by_clinic", nullable = false)
    @Builder.Default
    private Boolean isVerifiedByClinic = false;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PrescriptionItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (version == null) version = 1;
        if (isLatestActive == null) isLatestActive = true;
        if (isVerifiedByClinic == null) isVerifiedByClinic = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PrescriptionStatus {
        DRAFT, ISSUED, SENT_TO_PHARMACY, DISPENSED, CANCELLED
    }
}
