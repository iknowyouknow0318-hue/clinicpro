package com.clinicflow.dto;

import com.clinicflow.entity.Consultation;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDTO {
    private Long consultationId;

    @NotNull(message = "Visit ID is required")
    private Long visitId;

    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    private String symptoms;
    private String diagnosisNotes;
    private String clinicalNotes;

    private Consultation.ConsultationStatus status;
}
