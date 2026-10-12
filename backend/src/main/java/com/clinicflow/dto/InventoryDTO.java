package com.clinicflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDTO {
    private Long inventoryId;
    private Long medicineId;
    private String medicineName;
    private String genericName;
    private String manufacturer;
    private String dosageForm;
    private String strength;
    private String unit;
    private String batchNumber;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private Integer dispensedQuantity;
    private Integer reorderLevel;
    private LocalDate expiryDate;
    private BigDecimal unitPrice;
    private boolean isLowStock;
    private boolean isExpired;
    private boolean isNearExpiry;
}
