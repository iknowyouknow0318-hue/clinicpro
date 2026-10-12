package com.clinicflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private String role;
    private Long userId;
    private Long clinicId;
    private String clinicName;
    private Long patientId;
    private Long doctorId;
}
