package com.clinicflow.controller;

import com.clinicflow.dto.ApiResponse;
import com.clinicflow.dto.InventoryDTO;
import com.clinicflow.entity.Medicine;
import com.clinicflow.repository.MedicineRepository;
import com.clinicflow.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final MedicineRepository medicineRepository;

    @GetMapping("/medicines")
    public ResponseEntity<ApiResponse<List<Medicine>>> getAllMedicines() {
        return ResponseEntity.ok(ApiResponse.ok(medicineRepository.findAll()));
    }

    @GetMapping("/medicines/search")
    public ResponseEntity<ApiResponse<List<Medicine>>> searchMedicines(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.ok(medicineRepository.findByNameContainingIgnoreCase(query)));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<InventoryDTO>>> getAllInventory() {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getAllInventory()));
    }

    @GetMapping("/inventory/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryDTO>>> getLowStockAlerts() {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getLowStockAlerts()));
    }

    @GetMapping("/inventory/medicine/{medicineId}")
    public ResponseEntity<ApiResponse<List<InventoryDTO>>> getInventoryByMedicine(@PathVariable Long medicineId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getInventoryForMedicine(medicineId)));
    }

    @PutMapping("/inventory/{inventoryId}/quantity")
    public ResponseEntity<ApiResponse<InventoryDTO>> updateQuantity(
            @PathVariable Long inventoryId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.updateQuantity(inventoryId, quantity), "Stock updated"));
    }
}
