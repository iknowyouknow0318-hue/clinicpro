package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.IntelligenceDashboardDTO;
import com.clinicflow.service.IntelligenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/intelligence")
@RequiredArgsConstructor
public class IntelligenceController {

    private final IntelligenceService intelligenceService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<IntelligenceDashboardDTO>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(intelligenceService.getDashboardAnalytics()));
    }
}
