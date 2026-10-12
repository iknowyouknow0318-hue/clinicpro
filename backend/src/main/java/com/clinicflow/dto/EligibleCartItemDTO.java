package com.clinicflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibleCartItemDTO {
    private Long prescriptionItemId;
    private Long prescriptionId;
    private Integer prescriptionVersion;
    private Long medicineId;
    private String medicineName;
    private String genericName;
    private String dosage;
    private String frequency;
    private Integer prescribedQuantity;
    private Integer dispensedQuantity;
    private Integer remainingEligibleQuantity;
    private Integer availableStock;
    private BigDecimal unitPrice;
    private Boolean isAvailableInStock;
}
