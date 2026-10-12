package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.DoctorDTO;
import com.clinicflow.dto.DoctorScheduleDTO;
import com.clinicflow.entity.Doctor;
import com.clinicflow.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getAllDoctors()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctorById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctorByUserId(userId)));
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateAvailability(
            @PathVariable Long id,
            @RequestParam Doctor.Availability availability) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.updateAvailability(id, availability), "Doctor availability updated"));
    }

    @PutMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateSchedule(
            @PathVariable Long id,
            @RequestBody DoctorScheduleDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.updateSchedule(id, dto), "Doctor schedule updated successfully"));
    }

    @PutMapping("/{id}/delay")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateDelay(
            @PathVariable Long id,
            @RequestParam Integer delayMinutes) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.updateDelay(id, delayMinutes), "Doctor delay updated"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> searchDoctors(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String clinic,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false) Doctor.Availability availability) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.searchDoctors(query, specialty, clinic, location, maxFee, availability)));
    }
}
