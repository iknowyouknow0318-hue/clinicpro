package com.clinicflow.dto;

import com.clinicflow.entity.Doctor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleDTO {
    private String workingDays;
    private LocalTime workingStartTime;
    private LocalTime workingEndTime;
    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
    private Integer consultationDuration;
    private BigDecimal consultationFee;
    private Integer currentDelayMinutes;
    private Doctor.Availability availability;
}
