package com.clinicflow.dto;

import com.clinicflow.entity.Patient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class PatientDTO {
    private Long patientId;
    private Long userId;
    private Long clinicId;
    
    @NotBlank(message = "Patient name is required")
    private String name;
    
    @Email(message = "Valid email is required")
    private String email;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    private LocalDate dob;
    private Patient.Gender gender;
    private String bloodGroup;
    private String address;
    private LocalDateTime createdAt;
}
