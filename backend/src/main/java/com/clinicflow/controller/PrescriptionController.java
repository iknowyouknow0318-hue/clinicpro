package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.MedicationReconciliationDTO;
import com.clinicflow.dto.PrescriptionDTO;
import com.clinicflow.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PrescriptionDTO>> createPrescription(@Valid @RequestBody PrescriptionDTO dto) {
        PrescriptionDTO created = prescriptionService.createPrescription(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Digital prescription (v" + created.getVersion() + ") issued & forwarded to pharmacy"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.getPrescriptionById(id)));
    }

    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> getPrescriptionByConsultation(@PathVariable Long consultationId) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.getPrescriptionByConsultationId(consultationId)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<PrescriptionDTO>>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.getPrescriptionsByPatientId(patientId)));
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<ApiResponse<List<PrescriptionDTO>>> getActivePrescriptionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.getActivePrescriptionsByPatientId(patientId)));
    }

    @GetMapping("/reconciliation/{patientId}")
    public ResponseEntity<ApiResponse<MedicationReconciliationDTO>> getMedicationReconciliation(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok("Medication reconciliation loaded", prescriptionService.getMedicationReconciliation(patientId)));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> verifyPrescription(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Prescription verified by clinic", prescriptionService.verifyPrescriptionByClinic(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PrescriptionDTO>>> getAllPrescriptions() {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.getAllPrescriptions()));
    }
}
