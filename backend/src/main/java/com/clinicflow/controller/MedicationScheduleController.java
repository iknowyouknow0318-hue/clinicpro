package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.MedicationScheduleDTO;
import com.clinicflow.entity.MedicationSchedule;
import com.clinicflow.service.MedicationScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medication")
@RequiredArgsConstructor
public class MedicationScheduleController {

    private final MedicationScheduleService medicationScheduleService;

    @GetMapping("/schedule/today/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicationScheduleDTO>>> getTodaySchedule(@PathVariable Long patientId) {
        List<MedicationScheduleDTO> schedule = medicationScheduleService.getTodaySchedule(patientId);
        return ResponseEntity.ok(ApiResponse.ok("Today's medication schedule retrieved", schedule));
    }

    @GetMapping("/schedule/history/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicationScheduleDTO>>> getMedicationHistory(@PathVariable Long patientId) {
        List<MedicationScheduleDTO> history = medicationScheduleService.getMedicationHistory(patientId);
        return ResponseEntity.ok(ApiResponse.ok("Patient medication history retrieved", history));
    }

    @PutMapping("/schedule/{scheduleId}/adherence")
    public ResponseEntity<ApiResponse<MedicationScheduleDTO>> recordAdherence(
            @PathVariable Long scheduleId,
            @RequestBody Map<String, String> payload
    ) {
        String statusStr = payload.getOrDefault("status", "TAKEN");
        String notes = payload.get("notes");
        Long userId = payload.containsKey("userId") ? Long.parseLong(payload.get("userId")) : 1L;
        String userName = payload.getOrDefault("userName", "Patient");

        MedicationSchedule.AdherenceStatus status = MedicationSchedule.AdherenceStatus.valueOf(statusStr.toUpperCase());
        MedicationScheduleDTO updated = medicationScheduleService.recordAdherence(scheduleId, status, notes, userId, userName);
        return ResponseEntity.ok(ApiResponse.ok("Medication adherence recorded", updated));
    }
}
