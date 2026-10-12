package com.clinicflow.controller;

import com.clinicflow.dto.*;
import com.clinicflow.service.AuthService;
import com.clinicflow.service.SmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SmsService smsService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/clerk-sync")
    public ResponseEntity<ApiResponse<AuthResponse>> clerkSync(@Valid @RequestBody ClerkAuthRequest request) {
        AuthResponse response = authService.clerkSync(request);
        return ResponseEntity.ok(ApiResponse.success("Clerk sync successful", response));
    }

    @PostMapping("/send-phone-otp")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendPhoneOtp(@Valid @RequestBody PhoneOtpRequest request) {
        String code = smsService.generateAndSendOtp(request.getPhone(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Phone message OTP dispatched successfully", Map.of(
                "phone", request.getPhone(),
                "otp", code,
                "status", "DISPATCHED"
        )));
    }

    @PostMapping("/verify-phone-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPhoneOtp(@Valid @RequestBody PhoneOtpVerifyRequest request) {
        boolean valid = smsService.verifyOtp(request.getPhone(), request.getOtp());
        if (valid) {
            return ResponseEntity.ok(ApiResponse.success("Phone OTP verified successfully", Map.of(
                    "phone", request.getPhone(),
                    "verified", true
            )));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid or expired OTP code"));
        }
    }
}
