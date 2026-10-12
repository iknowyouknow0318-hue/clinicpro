package com.clinicflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationReconciliationDTO {
    private Long patientId;
    private String patientName;
    
    @Builder.Default
    private List<PrescriptionItemDTO> currentMedicines = new ArrayList<>();

    @Builder.Default
    private List<PrescriptionItemDTO> previousMedicines = new ArrayList<>();

    @Builder.Default
    private List<String> duplicateWarnings = new ArrayList<>();

    @Builder.Default
    private List<String> safetyAlerts = new ArrayList<>();

    @Builder.Default
    private List<PrescriptionDTO> prescriptionHistory = new ArrayList<>();
}
