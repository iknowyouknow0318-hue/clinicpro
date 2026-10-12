package com.clinicflow.dto;

import com.clinicflow.entity.PharmacyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyOrderDTO {
    private Long pharmacyOrderId;
    private Long prescriptionId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime receivedAt;
    private LocalDateTime processingStartedAt;
    private LocalDateTime readyAt;
    private LocalDateTime collectedAt;
    private PharmacyOrder.OrderStatus status;
    private String notes;
    private Integer queuePosition;
    private Integer estimatedProcessingMinutes;
    private List<PrescriptionItemDTO> items;
}
