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
public class DoctorDTO {
    private Long doctorId;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String licenseNo;
    private String specialty;
    private String qualification;
    private Doctor.Availability availability;
    private Integer experienceYears;
    private String clinicHospital;
    private String location;
    private BigDecimal consultationFee;
    private Integer consultationDuration;
    private String workingDays;
    private LocalTime workingStartTime;
    private LocalTime workingEndTime;
    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
    private Integer currentDelayMinutes;
    private String photoUrl;
    private Integer currentWaitingPatients;
    private Integer estimatedWaitMinutes;
    private String nextAvailableSlot;
}
