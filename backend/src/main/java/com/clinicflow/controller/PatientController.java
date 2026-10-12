package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.PatientDTO;
import com.clinicflow.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientDTO>>> getAllPatients() {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getAllPatients()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getPatientById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getPatientByUserId(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientDTO>> createPatient(@Valid @RequestBody PatientDTO dto) {
        PatientDTO created = patientService.createPatient(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Patient registered successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.updatePatient(id, dto), "Patient profile updated successfully"));
    }
}
