package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.ConsultationDTO;
import com.clinicflow.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping("/start/{visitId}")
    public ResponseEntity<ApiResponse<ConsultationDTO>> startConsultation(@PathVariable Long visitId) {
        ConsultationDTO dto = consultationService.startConsultation(visitId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(dto, "Consultation started"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ConsultationDTO>> saveConsultation(@Valid @RequestBody ConsultationDTO dto) {
        ConsultationDTO updated = consultationService.saveConsultation(dto);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Consultation saved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConsultationDTO>> getConsultationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getConsultationById(id)));
    }

    @GetMapping("/visit/{visitId}")
    public ResponseEntity<ApiResponse<ConsultationDTO>> getConsultationByVisitId(@PathVariable Long visitId) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getConsultationByVisitId(visitId)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<ConsultationDTO>>> getConsultationsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getConsultationsByPatient(patientId)));
    }
}
