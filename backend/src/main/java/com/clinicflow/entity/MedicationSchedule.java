package com.clinicflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medication_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_item_id")
    private PrescriptionItem prescriptionItem;

    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    @Column(length = 100)
    private String dosage;

    @Column(length = 100)
    private String frequency;

    @Column(length = 100)
    private String timing; // e.g., "Morning", "Afternoon", "Evening", "Night"

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "scheduled_time", length = 20)
    private String scheduledTime; // e.g. "08:00 AM", "01:00 PM", "08:00 PM"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private AdherenceStatus status = AdherenceStatus.SCHEDULED;

    @Column(name = "action_timestamp")
    private LocalDateTime actionTimestamp;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AdherenceStatus {
        SCHEDULED, TAKEN, MISSED, SKIPPED
    }
}
