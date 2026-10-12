package com.clinicflow.dto;

import com.clinicflow.entity.MedicationSchedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationScheduleDTO {
    private Long scheduleId;
    private Long patientId;
    private Long prescriptionId;
    private Long prescriptionItemId;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String timing;
    private LocalDate scheduledDate;
    private String scheduledTime;
    private MedicationSchedule.AdherenceStatus status;
    private LocalDateTime actionTimestamp;
    private String notes;
}
