package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.CheckInRequest;
import com.clinicflow.dto.QueueEntryDTO;
import com.clinicflow.entity.PatientQueue;
import com.clinicflow.service.QueueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    @PostMapping("/visits/check-in")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> checkIn(@Valid @RequestBody CheckInRequest request) {
        QueueEntryDTO entry = queueService.checkInAndJoinQueue(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(entry, "Patient checked in and joined queue with Token #" + entry.getTokenNumber()));
    }

    @PostMapping("/queue/join")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> joinQueue(@Valid @RequestBody CheckInRequest request) {
        return checkIn(request);
    }

    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<List<QueueEntryDTO>>> getAllQueue() {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getAllQueueEntries()));
    }

    @GetMapping("/queue/{doctorId}/status")
    public ResponseEntity<ApiResponse<List<QueueEntryDTO>>> getQueueForDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getQueueForDoctor(doctorId)));
    }

    @GetMapping("/queue/{doctorId}/active")
    public ResponseEntity<ApiResponse<List<QueueEntryDTO>>> getActiveQueueForDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getActiveQueueForDoctor(doctorId)));
    }

    @GetMapping("/queue/{doctorId}/public")
    public ResponseEntity<ApiResponse<List<QueueEntryDTO>>> getPublicQueueForDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getPublicQueueForDoctor(doctorId)));
    }

    @GetMapping("/queue/patient/{patientId}")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> getQueueForPatient(@PathVariable Long patientId) {
        QueueEntryDTO entry = queueService.getQueueForPatient(patientId);
        return ResponseEntity.ok(ApiResponse.ok(entry));
    }

    @GetMapping("/queue/entry/{id}")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> getQueueEntryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getQueueEntryById(id)));
    }

    @GetMapping("/queue/visit/{visitId}")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> getQueueEntryByVisit(@PathVariable Long visitId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getQueueEntryByVisitId(visitId)));
    }

    @PostMapping("/queue/{id}/start")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> startConsultation(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.startConsultation(id), "Consultation started"));
    }

    @PostMapping("/queue/{id}/complete")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> completeConsultation(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.completeConsultation(id), "Consultation completed"));
    }

    @PostMapping("/queue/{id}/no-show")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> markNoShow(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.markNoShow(id), "Patient marked as no-show"));
    }

    @PostMapping("/queue/doctor/{doctorId}/call-next")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> callNextPatient(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.callNextPatient(doctorId), "Next patient called"));
    }

    @PutMapping("/queue/{id}/status")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> updateQueueStatus(
            @PathVariable Long id,
            @RequestParam PatientQueue.QueueStatus status) {
        QueueEntryDTO updated = queueService.updateQueueStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Queue status updated to " + status));
    }
}
