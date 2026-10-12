package com.clinicflow.dto;

import com.clinicflow.entity.PatientQueue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueEntryDTO {
    private Long queueEntryId;
    private Long visitId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Integer tokenNumber;
    private PatientQueue.PriorityLevel priorityLevel;
    private PatientQueue.QueueStatus queueStatus;
    private LocalDateTime joinedAt;
    private LocalDateTime calledAt;
    private Integer estimatedWaitMinutes;
    private Integer patientsAhead;
}
