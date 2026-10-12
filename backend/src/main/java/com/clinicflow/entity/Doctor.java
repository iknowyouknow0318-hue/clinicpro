package com.clinicflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long doctorId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;

    @Column(name = "license_no", nullable = false, unique = true, length = 50)
    private String licenseNo;

    @Column(nullable = false, length = 100)
    private String specialty;

    @Column(length = 200)
    private String qualification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Availability availability = Availability.AVAILABLE;

    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 5;

    @Column(name = "clinic_hospital", length = 150)
    @Builder.Default
    private String clinicHospital = "City Care Central Clinic";

    @Column(length = 100)
    @Builder.Default
    private String location = "Main Healthcare Block, Floor 2";

    @Column(name = "consultation_fee", precision = 10, scale = 2)
    @Builder.Default
    private java.math.BigDecimal consultationFee = new java.math.BigDecimal("500.00");

    @Column(name = "consultation_duration")
    @Builder.Default
    private Integer consultationDuration = 15; // in minutes

    @Column(name = "working_days", length = 150)
    @Builder.Default
    private String workingDays = "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY";

    @Column(name = "working_start_time")
    @Builder.Default
    private java.time.LocalTime workingStartTime = java.time.LocalTime.of(9, 0);

    @Column(name = "working_end_time")
    @Builder.Default
    private java.time.LocalTime workingEndTime = java.time.LocalTime.of(17, 0);

    @Column(name = "break_start_time")
    @Builder.Default
    private java.time.LocalTime breakStartTime = java.time.LocalTime.of(13, 0);

    @Column(name = "break_end_time")
    @Builder.Default
    private java.time.LocalTime breakEndTime = java.time.LocalTime.of(14, 0);

    @Column(name = "current_delay_minutes")
    @Builder.Default
    private Integer currentDelayMinutes = 0;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

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

    public enum Availability {
        AVAILABLE, BUSY, OFF_DUTY
    }
}
