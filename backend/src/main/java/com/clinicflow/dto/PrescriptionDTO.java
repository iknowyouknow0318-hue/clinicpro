package com.clinicflow.dto;

import com.clinicflow.entity.Prescription;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {
    private Long prescriptionId;

    @NotNull(message = "Consultation ID is required")
    private Long consultationId;

    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;

    private LocalDateTime issuedAt;
    private Prescription.PrescriptionStatus status;
    
    private Integer version;
    private Boolean isLatestActive;
    private Long previousPrescriptionId;
    private Boolean isVerifiedByClinic;
    private String verificationStatus; // VERIFIED_IN_STOCK, PARTIALLY_AVAILABLE, OUT_OF_STOCK, PENDING_VERIFICATION

    private String instructions;

    @NotEmpty(message = "At least one medicine item is required")
    @Valid
    @Builder.Default
    private List<PrescriptionItemDTO> items = new ArrayList<>();
}
