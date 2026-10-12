package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.FollowUpDTO;
import com.clinicflow.entity.FollowUp;
import com.clinicflow.service.FollowUpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follow-ups")
@RequiredArgsConstructor
public class FollowUpController {

    private final FollowUpService followUpService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FollowUpDTO>>> getAllFollowUps() {
        return ResponseEntity.ok(ApiResponse.ok(followUpService.getAllFollowUps()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<FollowUpDTO>>> getFollowUpsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(followUpService.getFollowUpsByPatient(patientId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FollowUpDTO>> scheduleFollowUp(@Valid @RequestBody FollowUpDTO dto) {
        FollowUpDTO scheduled = followUpService.scheduleFollowUp(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(scheduled, "Follow-up scheduled successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<FollowUpDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam FollowUp.FollowUpStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(followUpService.updateStatus(id, status), "Follow-up status updated"));
    }
}
