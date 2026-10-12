package com.clinicflow.dto;

import com.clinicflow.entity.Appointment;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private Long appointmentId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;
    private String patientName;
    private String patientPhone;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private String doctorQualification;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledAt;

    private Integer durationMinutes;
    private BigDecimal consultationFee;
    private String clinicHospital;

    private Appointment.AppointmentType type;
    private Appointment.AppointmentStatus status;
    private String notes;

    // Live Queue / Arrival tracking fields
    private Integer tokenNumber;
    private Integer queuePosition;
    private Integer patientsAhead;
    private Integer estimatedWaitMinutes;
    private LocalDateTime checkInTime;

    private LocalDateTime createdAt;
}
