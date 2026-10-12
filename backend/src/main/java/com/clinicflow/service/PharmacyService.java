package com.clinicflow.service;

import com.clinicflow.dto.EligibleCartItemDTO;
import com.clinicflow.dto.PatientOrderRequestDTO;
import com.clinicflow.dto.PharmacyOrderDTO;
import com.clinicflow.dto.PrescriptionItemDTO;
import com.clinicflow.entity.*;
import com.clinicflow.exception.BadRequestException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacyService {

    private final PharmacyOrderRepository pharmacyOrderRepository;
    private final PharmacyQueueRepository pharmacyQueueRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicineInventoryRepository inventoryRepository;
    private final NotificationRepository notificationRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    public List<PharmacyOrderDTO> getAllOrders() {
        return pharmacyOrderRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PharmacyOrderDTO> getActiveOrders() {
        return pharmacyOrderRepository.findByStatusIn(List.of(
                PharmacyOrder.OrderStatus.RECEIVED,
                PharmacyOrder.OrderStatus.CHECKING,
                PharmacyOrder.OrderStatus.PROCESSING,
                PharmacyOrder.OrderStatus.READY
        )).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PharmacyOrderDTO> getOrdersByPatientId(Long patientId) {
        return pharmacyOrderRepository.findAll().stream()
                .filter(o -> o.getPrescription() != null && o.getPrescription().getPatient() != null &&
                        o.getPrescription().getPatient().getPatientId().equals(patientId))
                .sorted((a, b) -> b.getReceivedAt().compareTo(a.getReceivedAt()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PharmacyOrderDTO getOrderById(Long id) {
        PharmacyOrder order = pharmacyOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy order not found: " + id));
        return mapToDTO(order);
    }

    @Transactional(readOnly = true)
    public List<EligibleCartItemDTO> getEligibleCartMedicines(Long patientId) {
        List<Prescription> activePrescriptions = prescriptionRepository.findByPatient_PatientIdAndIsLatestActiveTrue(patientId);
        List<EligibleCartItemDTO> eligibleItems = new ArrayList<>();

        for (Prescription rx : activePrescriptions) {
            for (PrescriptionItem item : rx.getItems()) {
                int prescribed = item.getPrescribedQuantity() != null ? item.getPrescribedQuantity() : (item.getQuantity() != null ? item.getQuantity() : 0);
                int dispensed = item.getDispensedQuantity() != null ? item.getDispensedQuantity() : 0;
                int remaining = Math.max(0, prescribed - dispensed);

                if (remaining > 0 && item.getMedicine() != null) {
                    Integer availableStock = inventoryRepository.findTotalAvailableQuantity(item.getMedicine().getMedicineId());
                    if (availableStock == null) availableStock = 0;

                    BigDecimal unitPrice = item.getMedicine().getPrice() != null ? item.getMedicine().getPrice() : BigDecimal.valueOf(15.00);

                    EligibleCartItemDTO cartItem = EligibleCartItemDTO.builder()
                            .prescriptionItemId(item.getPrescriptionItemId())
                            .prescriptionId(rx.getPrescriptionId())
                            .prescriptionVersion(rx.getVersion() != null ? rx.getVersion() : 1)
                            .medicineId(item.getMedicine().getMedicineId())
                            .medicineName(item.getMedicine().getName())
                            .genericName(item.getMedicine().getGenericName())
                            .dosage(item.getDosage())
                            .frequency(item.getFrequency())
                            .prescribedQuantity(prescribed)
                            .dispensedQuantity(dispensed)
                            .remainingEligibleQuantity(remaining)
                            .availableStock(availableStock)
                            .unitPrice(unitPrice)
                            .isAvailableInStock(availableStock > 0)
                            .build();

                    eligibleItems.add(cartItem);
                }
            }
        }

        return eligibleItems;
    }

    @Transactional
    public PharmacyOrderDTO createPatientOrderFromCart(PatientOrderRequestDTO request, Long userId, String userName) {
        if (!patientRepository.existsById(request.getPatientId())) {
            throw new ResourceNotFoundException("Patient not found: " + request.getPatientId());
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create order with an empty cart");
        }

        Prescription targetPrescription = null;

        for (PatientOrderRequestDTO.OrderItemDTO itemRequest : request.getItems()) {
            PrescriptionItem pItem = prescriptionItemRepository.findById(itemRequest.getPrescriptionItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Prescription item not found: " + itemRequest.getPrescriptionItemId()));

            if (targetPrescription == null) {
                targetPrescription = pItem.getPrescription();
            }

            int prescribed = pItem.getPrescribedQuantity() != null ? pItem.getPrescribedQuantity() : (pItem.getQuantity() != null ? pItem.getQuantity() : 0);
            int dispensed = pItem.getDispensedQuantity() != null ? pItem.getDispensedQuantity() : 0;
            int remainingEligible = Math.max(0, prescribed - dispensed);

            if (itemRequest.getQuantity() <= 0) {
                throw new BadRequestException("Order quantity must be greater than zero for " + pItem.getMedicine().getName());
            }

            if (itemRequest.getQuantity() > remainingEligible) {
                throw new BadRequestException(String.format("Cannot order %d units of %s. Remaining eligible prescription limit is %d units.",
                        itemRequest.getQuantity(), pItem.getMedicine().getName(), remainingEligible));
            }

            // Reserve quantity
            int currentReserved = pItem.getReservedQuantity() != null ? pItem.getReservedQuantity() : 0;
            pItem.setReservedQuantity(currentReserved + itemRequest.getQuantity());
            prescriptionItemRepository.save(pItem);
        }

        if (targetPrescription == null) {
            throw new BadRequestException("Invalid prescription reference for cart items");
        }

        PharmacyOrder pharmacyOrder = PharmacyOrder.builder()
                .prescription(targetPrescription)
                .receivedAt(LocalDateTime.now())
                .status(PharmacyOrder.OrderStatus.RECEIVED)
                .notes("Patient Portal Self-Service Order (" + request.getItems().size() + " prescribed items). " +
                        (request.getDeliveryNotes() != null ? request.getDeliveryNotes() : ""))
                .build();

        PharmacyOrder savedOrder = pharmacyOrderRepository.save(pharmacyOrder);

        long currentWaitingInPharmacy = pharmacyQueueRepository.findByStatusOrderByQueuePositionAsc(PharmacyQueue.PharmacyQueueStatus.WAITING).size();
        int nextQueuePos = (int) currentWaitingInPharmacy + 1;
        int estimatedProcessingTime = nextQueuePos * 6;

        PharmacyQueue pharmacyQueue = PharmacyQueue.builder()
                .pharmacyOrder(savedOrder)
                .queuePosition(nextQueuePos)
                .joinedAt(LocalDateTime.now())
                .estimatedProcessingMinutes(estimatedProcessingTime)
                .status(PharmacyQueue.PharmacyQueueStatus.WAITING)
                .build();
        pharmacyQueueRepository.save(pharmacyQueue);

        auditService.logAction(
                userId,
                userName,
                "PATIENT",
                "PATIENT_ORDER_PLACED",
                "PharmacyOrder",
                savedOrder.getPharmacyOrderId(),
                String.format("Patient placed prescription-validated order #%d for %d items",
                        savedOrder.getPharmacyOrderId(), request.getItems().size())
        );

        return mapToDTO(savedOrder);
    }

    @Transactional
    public PharmacyOrderDTO updateOrderStatus(Long orderId, PharmacyOrder.OrderStatus newStatus) {
        PharmacyOrder order = pharmacyOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy order not found: " + orderId));

        order.setStatus(newStatus);
        Optional<PharmacyQueue> queueOpt = pharmacyQueueRepository.findByPharmacyOrder_PharmacyOrderId(orderId);

        if (newStatus == PharmacyOrder.OrderStatus.PROCESSING) {
            order.setProcessingStartedAt(LocalDateTime.now());
            queueOpt.ifPresent(q -> {
                q.setStatus(PharmacyQueue.PharmacyQueueStatus.PROCESSING);
                pharmacyQueueRepository.save(q);
            });
        } else if (newStatus == PharmacyOrder.OrderStatus.READY) {
            order.setReadyAt(LocalDateTime.now());
            queueOpt.ifPresent(q -> {
                q.setStatus(PharmacyQueue.PharmacyQueueStatus.READY);
                pharmacyQueueRepository.save(q);
            });

            // Notify patient that medication is ready
            Notification notification = Notification.builder()
                    .patient(order.getPrescription().getPatient())
                    .message("Your medication order #" + order.getPharmacyOrderId() + " is READY for pickup at the Pharmacy Counter.")
                    .type(Notification.NotificationType.PHARMACY_READY)
                    .status(Notification.NotificationStatus.UNREAD)
                    .build();
            notificationRepository.save(notification);
        } else if (newStatus == PharmacyOrder.OrderStatus.COLLECTED || newStatus == PharmacyOrder.OrderStatus.DISPENSED) {
            order.setCollectedAt(LocalDateTime.now());
            queueOpt.ifPresent(q -> {
                q.setStatus(PharmacyQueue.PharmacyQueueStatus.COLLECTED);
                pharmacyQueueRepository.save(q);
            });

            Prescription rx = order.getPrescription();
            rx.setStatus(Prescription.PrescriptionStatus.DISPENSED);
            prescriptionRepository.save(rx);

            // Deduct stock using FEFO and update prescription item dispensed quantity
            for (PrescriptionItem item : rx.getItems()) {
                deductInventoryStockFEFO(item.getMedicine().getMedicineId(), item.getQuantity());

                int alreadyDispensed = item.getDispensedQuantity() != null ? item.getDispensedQuantity() : 0;
                item.setDispensedQuantity(alreadyDispensed + item.getQuantity());
                item.setReservedQuantity(0);
                prescriptionItemRepository.save(item);
            }

            auditService.logAction(
                    1L,
                    "Clinic Pharmacist",
                    "PHARMACY",
                    "MEDICINE_DISPENSED",
                    "PharmacyOrder",
                    order.getPharmacyOrderId(),
                    "Dispensed order #" + order.getPharmacyOrderId() + " via FEFO batch inventory"
            );
        }

        PharmacyOrder saved = pharmacyOrderRepository.save(order);
        return mapToDTO(saved);
    }

    private void deductInventoryStockFEFO(Long medicineId, int quantityToDeduct) {
        List<MedicineInventory> batches = inventoryRepository.findAvailableBatchesFEFO(medicineId);
        int remaining = quantityToDeduct;

        for (MedicineInventory batch : batches) {
            if (remaining <= 0) break;
            if (batch.getAvailableQuantity() > 0) {
                int deduct = Math.min(batch.getAvailableQuantity(), remaining);
                batch.setAvailableQuantity(batch.getAvailableQuantity() - deduct);
                int disp = batch.getDispensedQuantity() != null ? batch.getDispensedQuantity() : 0;
                batch.setDispensedQuantity(disp + deduct);
                remaining -= deduct;
                inventoryRepository.save(batch);
                log.info("FEFO: Deducted {} units of Med #{} from Batch {} (Exp: {})", deduct, medicineId, batch.getBatchNumber(), batch.getExpiryDate());
            }
        }
    }

    public PharmacyOrderDTO mapToDTO(PharmacyOrder order) {
        Optional<PharmacyQueue> qOpt = pharmacyQueueRepository.findByPharmacyOrder_PharmacyOrderId(order.getPharmacyOrderId());

        List<PrescriptionItemDTO> items = order.getPrescription() != null && order.getPrescription().getItems() != null ?
                order.getPrescription().getItems().stream()
                        .map(item -> {
                            Integer stock = inventoryRepository.findTotalAvailableQuantity(item.getMedicine().getMedicineId());
                            return PrescriptionItemDTO.builder()
                                    .prescriptionItemId(item.getPrescriptionItemId())
                                    .medicineId(item.getMedicine().getMedicineId())
                                    .medicineName(item.getMedicine().getName())
                                    .genericName(item.getMedicine().getGenericName())
                                    .dosage(item.getDosage())
                                    .frequency(item.getFrequency())
                                    .durationDays(item.getDurationDays())
                                    .quantity(item.getQuantity())
                                    .prescribedQuantity(item.getPrescribedQuantity())
                                    .dispensedQuantity(item.getDispensedQuantity())
                                    .availableStock(stock != null ? stock : 0)
                                    .instructions(item.getInstructions())
                                    .build();
                        })
                        .collect(Collectors.toList()) : new ArrayList<>();

        return PharmacyOrderDTO.builder()
                .pharmacyOrderId(order.getPharmacyOrderId())
                .prescriptionId(order.getPrescription() != null ? order.getPrescription().getPrescriptionId() : null)
                .patientId(order.getPrescription() != null && order.getPrescription().getPatient() != null ? order.getPrescription().getPatient().getPatientId() : null)
                .patientName(order.getPrescription() != null && order.getPrescription().getPatient() != null && order.getPrescription().getPatient().getUser() != null ? order.getPrescription().getPatient().getUser().getName() : "")
                .doctorId(order.getPrescription() != null && order.getPrescription().getDoctor() != null ? order.getPrescription().getDoctor().getDoctorId() : null)
                .doctorName(order.getPrescription() != null && order.getPrescription().getDoctor() != null && order.getPrescription().getDoctor().getUser() != null ? order.getPrescription().getDoctor().getUser().getName() : "")
                .receivedAt(order.getReceivedAt())
                .processingStartedAt(order.getProcessingStartedAt())
                .readyAt(order.getReadyAt())
                .collectedAt(order.getCollectedAt())
                .status(order.getStatus())
                .notes(order.getNotes())
                .queuePosition(qOpt.map(PharmacyQueue::getQueuePosition).orElse(null))
                .estimatedProcessingMinutes(qOpt.map(PharmacyQueue::getEstimatedProcessingMinutes).orElse(null))
                .items(items)
                .build();
    }
}
