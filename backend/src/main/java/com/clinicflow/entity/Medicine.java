package com.clinicflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicine")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long medicineId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "generic_name", length = 200)
    private String genericName;

    @Column(length = 200)
    private String manufacturer;

    @Column(length = 100)
    private String category;

    @Column(name = "dosage_form", length = 50)
    @Builder.Default
    private String dosageForm = "Tablet"; // Tablet, Syrup, Capsule, Injection, Ointment

    @Column(length = 50)
    private String strength; // e.g. "500 mg", "10 ml", "250 mg"

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String unit = "tablet";

    @Column(name = "is_prescription_required", nullable = false)
    @Builder.Default
    private Boolean isPrescriptionRequired = true;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.valueOf(15.00);

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (dosageForm == null) dosageForm = "Tablet";
        if (unit == null) unit = "tablet";
        if (isPrescriptionRequired == null) isPrescriptionRequired = true;
        if (price == null) price = BigDecimal.valueOf(15.00);
        if (isActive == null) isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
