package com.clinicflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhoneOtpRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;
    private String otp;
}
