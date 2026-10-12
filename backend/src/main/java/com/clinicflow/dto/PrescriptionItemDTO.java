package com.clinicflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemDTO {
    private Long prescriptionItemId;

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;
    private String medicineName;
    private String genericName;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    private String timing; // e.g. "Morning, Night"

    @NotNull(message = "Duration in days is required")
    private Integer durationDays;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private Integer prescribedQuantity;
    private Integer dispensedQuantity;
    private Integer reservedQuantity;
    private Integer remainingQuantity;
    private Integer availableStock;
    private String stockStatus; // IN_STOCK, PARTIAL_STOCK, OUT_OF_STOCK
    private Double unitPrice;

    private String instructions;
}
