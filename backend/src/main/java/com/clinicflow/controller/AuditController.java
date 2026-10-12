package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.AuditLogDTO;
import com.clinicflow.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getRecentAuditLogs() {
        List<AuditLogDTO> logs = auditService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.ok("Audit logs fetched successfully", logs));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogsByUser(@PathVariable Long userId) {
        List<AuditLogDTO> logs = auditService.getAuditLogsByUser(userId);
        return ResponseEntity.ok(ApiResponse.ok("User audit logs fetched successfully", logs));
    }
}
