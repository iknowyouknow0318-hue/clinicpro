package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.EligibleCartItemDTO;
import com.clinicflow.dto.PatientOrderRequestDTO;
import com.clinicflow.dto.PharmacyOrderDTO;
import com.clinicflow.entity.PharmacyOrder;
import com.clinicflow.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<PharmacyOrderDTO>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok(pharmacyService.getAllOrders()));
    }

    @GetMapping("/orders/active")
    public ResponseEntity<ApiResponse<List<PharmacyOrderDTO>>> getActiveOrders() {
        return ResponseEntity.ok(ApiResponse.ok(pharmacyService.getActiveOrders()));
    }

    @GetMapping("/orders/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<PharmacyOrderDTO>>> getOrdersByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(pharmacyService.getOrdersByPatientId(patientId)));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<PharmacyOrderDTO>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(pharmacyService.getOrderById(id)));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<PharmacyOrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam PharmacyOrder.OrderStatus status) {
        PharmacyOrderDTO updated = pharmacyService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Pharmacy order updated to " + status));
    }

    @GetMapping("/cart/eligible/{patientId}")
    public ResponseEntity<ApiResponse<List<EligibleCartItemDTO>>> getEligibleCartMedicines(@PathVariable Long patientId) {
        List<EligibleCartItemDTO> items = pharmacyService.getEligibleCartMedicines(patientId);
        return ResponseEntity.ok(ApiResponse.ok("Eligible prescription medicines retrieved", items));
    }

    @PostMapping("/cart/order")
    public ResponseEntity<ApiResponse<PharmacyOrderDTO>> createPatientOrder(
            @Valid @RequestBody PatientOrderRequestDTO request,
            @RequestParam(required = false, defaultValue = "1") Long userId,
            @RequestParam(required = false, defaultValue = "Patient") String userName
    ) {
        PharmacyOrderDTO created = pharmacyService.createPatientOrderFromCart(request, userId, userName);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Order successfully placed and routed to pharmacy"));
    }
}
