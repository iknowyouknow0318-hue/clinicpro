package com.clinicflow.repository;

import com.clinicflow.entity.MedicineInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineInventoryRepository extends JpaRepository<MedicineInventory, Long> {
    List<MedicineInventory> findByMedicine_MedicineId(Long medicineId);

    @Query("SELECT mi FROM MedicineInventory mi WHERE mi.medicine.medicineId = :medicineId AND mi.expiryDate > CURRENT_DATE AND mi.availableQuantity > 0 ORDER BY mi.expiryDate ASC")
    List<MedicineInventory> findAvailableBatchesFEFO(Long medicineId);

    @Query("SELECT mi FROM MedicineInventory mi WHERE mi.availableQuantity <= mi.reorderLevel")
    List<MedicineInventory> findLowStockItems();

    @Query("SELECT mi FROM MedicineInventory mi WHERE mi.expiryDate <= :date")
    List<MedicineInventory> findExpiredOrNearExpiry(LocalDate date);

    @Query("SELECT COALESCE(SUM(mi.availableQuantity), 0) FROM MedicineInventory mi " +
           "WHERE mi.medicine.medicineId = :medicineId AND mi.expiryDate > CURRENT_DATE")
    Integer findTotalAvailableQuantity(Long medicineId);
}
