package com.clinicflow.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientOrderRequestDTO {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotEmpty(message = "At least one item is required in the cart")
    private List<OrderItemDTO> items;

    private String deliveryNotes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        @NotNull(message = "Prescription item ID is required")
        private Long prescriptionItemId;

        @NotNull(message = "Medicine ID is required")
        private Long medicineId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;
    }
}
