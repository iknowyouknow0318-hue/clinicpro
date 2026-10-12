package com.clinicflow.repository;

import com.clinicflow.entity.PharmacyQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyQueueRepository extends JpaRepository<PharmacyQueue, Long> {
    Optional<PharmacyQueue> findByPharmacyOrder_PharmacyOrderId(Long pharmacyOrderId);
    List<PharmacyQueue> findByStatusOrderByQueuePositionAsc(PharmacyQueue.PharmacyQueueStatus status);
    List<PharmacyQueue> findAllByOrderByQueuePositionAsc();
}
