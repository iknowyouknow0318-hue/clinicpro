package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.NotificationDTO;
import com.clinicflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotificationsForPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getNotificationsForPatient(patientId)));
    }

    @GetMapping("/patient/{patientId}/unread")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getUnreadNotificationsForPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadNotificationsForPatient(patientId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDTO>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.markAsRead(id)));
    }
}
