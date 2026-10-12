package com.clinicflow.dto;

import com.clinicflow.entity.FollowUp;
import jakarta.validation.constraints.NotNull;
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
public class FollowUpDTO {
    private Long followUpId;

    @NotNull(message = "Visit ID is required")
    private Long visitId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;
    private String patientName;

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;

    private String reason;
    private FollowUp.FollowUpStatus status;
    private LocalDateTime completedAt;
}
