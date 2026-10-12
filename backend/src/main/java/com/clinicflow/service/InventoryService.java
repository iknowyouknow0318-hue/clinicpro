package com.clinicflow.service;

import com.clinicflow.dto.InventoryDTO;
import com.clinicflow.entity.MedicineInventory;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.MedicineInventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final MedicineInventoryRepository inventoryRepository;
    private final AuditService auditService;

    public List<InventoryDTO> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryDTO> getLowStockAlerts() {
        return inventoryRepository.findLowStockItems().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryDTO> getInventoryForMedicine(Long medicineId) {
        return inventoryRepository.findByMedicine_MedicineId(medicineId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public InventoryDTO updateQuantity(Long inventoryId, Integer newQuantity) {
        MedicineInventory batch = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory batch not found: " + inventoryId));
        int oldQty = batch.getAvailableQuantity() != null ? batch.getAvailableQuantity() : 0;
        batch.setAvailableQuantity(newQuantity);
        MedicineInventory saved = inventoryRepository.save(batch);

        auditService.logAction(
                1L,
                "Clinic Pharmacist",
                "PHARMACY",
                "INVENTORY_STOCK_ADJUSTED",
                "MedicineInventory",
                inventoryId,
                String.format("Stock adjusted for %s (Batch: %s) from %d to %d units",
                        batch.getMedicine() != null ? batch.getMedicine().getName() : "Medicine",
                        batch.getBatchNumber(), oldQty, newQuantity)
        );

        return mapToDTO(saved);
    }

    public InventoryDTO mapToDTO(MedicineInventory mi) {
        int avail = mi.getAvailableQuantity() != null ? mi.getAvailableQuantity() : 0;
        int reorder = mi.getReorderLevel() != null ? mi.getReorderLevel() : 10;
        boolean isLow = avail <= reorder;

        LocalDate now = LocalDate.now();
        boolean isExpired = mi.getExpiryDate() != null && mi.getExpiryDate().isBefore(now);
        boolean isNearExpiry = mi.getExpiryDate() != null && !isExpired && mi.getExpiryDate().isBefore(now.plusMonths(2));

        return InventoryDTO.builder()
                .inventoryId(mi.getInventoryId())
                .medicineId(mi.getMedicine() != null ? mi.getMedicine().getMedicineId() : null)
                .medicineName(mi.getMedicine() != null ? mi.getMedicine().getName() : "")
                .genericName(mi.getMedicine() != null ? mi.getMedicine().getGenericName() : "")
                .manufacturer(mi.getMedicine() != null ? mi.getMedicine().getManufacturer() : "")
                .dosageForm(mi.getMedicine() != null ? mi.getMedicine().getDosageForm() : "Tablet")
                .strength(mi.getMedicine() != null ? mi.getMedicine().getStrength() : "")
                .unit(mi.getMedicine() != null ? mi.getMedicine().getUnit() : "tablet")
                .batchNumber(mi.getBatchNumber())
                .availableQuantity(avail)
                .reservedQuantity(mi.getReservedQuantity() != null ? mi.getReservedQuantity() : 0)
                .dispensedQuantity(mi.getDispensedQuantity() != null ? mi.getDispensedQuantity() : 0)
                .reorderLevel(reorder)
                .expiryDate(mi.getExpiryDate())
                .unitPrice(mi.getUnitPrice())
                .isLowStock(isLow)
                .isExpired(isExpired)
                .isNearExpiry(isNearExpiry)
                .build();
    }
}
