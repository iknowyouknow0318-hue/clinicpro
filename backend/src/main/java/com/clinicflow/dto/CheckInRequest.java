package com.clinicflow.dto;

import com.clinicflow.entity.PatientQueue;
import com.clinicflow.entity.Visit;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckInRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private Long appointmentId;
    private Visit.VisitType visitType = Visit.VisitType.APPOINTMENT;
    private PatientQueue.PriorityLevel priorityLevel = PatientQueue.PriorityLevel.NORMAL;
}
