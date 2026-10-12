package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.ClinicDTO;
import com.clinicflow.service.ClinicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinics")
@RequiredArgsConstructor
public class ClinicController {

    private final ClinicService clinicService;

    @PostMapping
    public ResponseEntity<ApiResponse<ClinicDTO>> createClinic(@RequestBody ClinicDTO request) {
        ClinicDTO created = clinicService.createClinic(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Clinic created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClinicDTO>>> getAllClinics() {
        List<ClinicDTO> clinics = clinicService.getAllClinics();
        return ResponseEntity.ok(ApiResponse.success("Clinics retrieved successfully", clinics));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ClinicDTO>>> getActiveClinics() {
        List<ClinicDTO> clinics = clinicService.getActiveClinics();
        return ResponseEntity.ok(ApiResponse.success("Active clinics retrieved successfully", clinics));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClinicDTO>> getClinicById(@PathVariable Long id) {
        ClinicDTO clinic = clinicService.getClinicById(id);
        return ResponseEntity.ok(ApiResponse.success("Clinic retrieved successfully", clinic));
    }

    @GetMapping("/identifier/{identifier}")
    public ResponseEntity<ApiResponse<ClinicDTO>> getClinicByIdentifier(@PathVariable String identifier) {
        ClinicDTO clinic = clinicService.getClinicByIdentifier(identifier);
        return ResponseEntity.ok(ApiResponse.success("Clinic retrieved successfully", clinic));
    }
}
