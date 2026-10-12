package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.AppointmentDTO;
import com.clinicflow.dto.SlotDTO;
import com.clinicflow.entity.Appointment;
import com.clinicflow.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAllAppointments(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long patientId) {
        if (doctorId != null) {
            return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAppointmentsByDoctor(doctorId)));
        } else if (patientId != null) {
            return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAppointmentsByPatient(patientId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAllAppointments()));
    }

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<SlotDTO>>> getSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<SlotDTO> slots = appointmentService.getAvailableSlots(doctorId, date);
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAppointmentById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDTO>> createAppointment(@Valid @RequestBody AppointmentDTO dto) {
        AppointmentDTO created = appointmentService.createAppointment(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Appointment booked successfully"));
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<AppointmentDTO>> checkIn(@PathVariable Long id) {
        AppointmentDTO updated = appointmentService.checkInAppointment(id);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Checked in successfully! Token #" + updated.getTokenNumber()));
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDTO>> reschedule(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String timeStr = body.get("newScheduledAt");
        String reason = body.get("reason");
        LocalDateTime newTime = LocalDateTime.parse(timeStr);
        AppointmentDTO updated = appointmentService.rescheduleAppointment(id, newTime, reason);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Appointment rescheduled successfully"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancel(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        AppointmentDTO updated = appointmentService.cancelAppointment(id, reason);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Appointment cancelled successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam Appointment.AppointmentStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.updateStatus(id, status), "Appointment status updated"));
    }
}
