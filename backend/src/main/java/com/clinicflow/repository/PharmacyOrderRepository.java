package com.clinicflow.repository;

import com.clinicflow.entity.PharmacyOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyOrderRepository extends JpaRepository<PharmacyOrder, Long> {
    Optional<PharmacyOrder> findByPrescription_PrescriptionId(Long prescriptionId);
    List<PharmacyOrder> findByStatus(PharmacyOrder.OrderStatus status);
    List<PharmacyOrder> findByStatusIn(List<PharmacyOrder.OrderStatus> statuses);
}
