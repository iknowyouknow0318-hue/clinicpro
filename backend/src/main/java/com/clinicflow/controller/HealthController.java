package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        Map<String, String> health = Map.of(
                "status", "UP",
                "application", "ClinicFlow AI",
                "version", "1.0.0"
        );
        return ResponseEntity.ok(ApiResponse.success("System operational", health));
    }
}
