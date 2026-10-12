package com.clinicflow.service;

import com.clinicflow.dto.MedicationReconciliationDTO;
import com.clinicflow.dto.PrescriptionDTO;
import com.clinicflow.dto.PrescriptionItemDTO;
import com.clinicflow.entity.*;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final ConsultationRepository consultationRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineInventoryRepository medicineInventoryRepository;
    private final PharmacyOrderRepository pharmacyOrderRepository;
    private final PharmacyQueueRepository pharmacyQueueRepository;
    private final NotificationRepository notificationRepository;
    private final MedicationScheduleService medicationScheduleService;
    private final AuditService auditService;

    @Transactional
    public PrescriptionDTO createPrescription(PrescriptionDTO dto) {
        Consultation consultation = consultationRepository.findById(dto.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found: " + dto.getConsultationId()));

        Patient patient = consultation.getPatient();
        Doctor doctor = consultation.getDoctor();

        // Check for existing prescriptions for this consultation to handle Version Control (V1 -> V2)
        List<Prescription> existingVersions = prescriptionRepository.findByConsultation_ConsultationIdOrderByVersionDesc(consultation.getConsultationId());
        int newVersion = 1;
        Long previousId = null;

        if (!existingVersions.isEmpty()) {
            Prescription latestPrior = existingVersions.get(0);
            newVersion = (latestPrior.getVersion() != null ? latestPrior.getVersion() : 1) + 1;
            previousId = latestPrior.getPrescriptionId();

            // Mark all existing versions for this consultation as non-latest
            for (Prescription p : existingVersions) {
                p.setIsLatestActive(false);
            }
            prescriptionRepository.saveAll(existingVersions);
        }

        Prescription prescription = Prescription.builder()
                .consultation(consultation)
                .patient(patient)
                .doctor(doctor)
                .issuedAt(LocalDateTime.now())
                .status(Prescription.PrescriptionStatus.SENT_TO_PHARMACY)
                .version(newVersion)
                .isLatestActive(true)
                .previousPrescriptionId(previousId)
                .isVerifiedByClinic(false)
                .instructions(dto.getInstructions())
                .items(new ArrayList<>())
                .build();

        for (PrescriptionItemDTO itemDto : dto.getItems()) {
            Medicine med = medicineRepository.findById(itemDto.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + itemDto.getMedicineId()));

            int qty = itemDto.getQuantity() != null ? itemDto.getQuantity() : 10;
            PrescriptionItem item = PrescriptionItem.builder()
                    .prescription(prescription)
                    .medicine(med)
                    .dosage(itemDto.getDosage())
                    .frequency(itemDto.getFrequency())
                    .timing(itemDto.getTiming() != null ? itemDto.getTiming() : "With meals")
                    .durationDays(itemDto.getDurationDays() != null ? itemDto.getDurationDays() : 7)
                    .quantity(qty)
                    .prescribedQuantity(qty)
                    .dispensedQuantity(0)
                    .reservedQuantity(0)
                    .instructions(itemDto.getInstructions())
                    .build();

            prescription.getItems().add(item);
        }

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // --- PATIENT MEDICATION SCHEDULE & REMINDER GENERATION ---
        medicationScheduleService.generateScheduleForPrescription(savedPrescription);

        // --- PHARMACY ORDER INTEGRATION ---
        PharmacyOrder pharmacyOrder = PharmacyOrder.builder()
                .prescription(savedPrescription)
                .receivedAt(LocalDateTime.now())
                .status(PharmacyOrder.OrderStatus.RECEIVED)
                .notes("Doctor " + (doctor.getUser() != null ? doctor.getUser().getName() : "") + " Prescription V" + newVersion)
                .build();
        PharmacyOrder savedOrder = pharmacyOrderRepository.save(pharmacyOrder);

        // Calculate queue position
        long currentWaitingInPharmacy = pharmacyQueueRepository.findByStatusOrderByQueuePositionAsc(PharmacyQueue.PharmacyQueueStatus.WAITING).size();
        int nextQueuePos = (int) currentWaitingInPharmacy + 1;
        int estimatedProcessingTime = nextQueuePos * 8;

        PharmacyQueue pharmacyQueue = PharmacyQueue.builder()
                .pharmacyOrder(savedOrder)
                .queuePosition(nextQueuePos)
                .joinedAt(LocalDateTime.now())
                .estimatedProcessingMinutes(estimatedProcessingTime)
                .status(PharmacyQueue.PharmacyQueueStatus.WAITING)
                .build();
        pharmacyQueueRepository.save(pharmacyQueue);

        // Audit Trail
        String doctorName = doctor.getUser() != null ? doctor.getUser().getName() : "Doctor";
        auditService.logAction(
                doctor.getUser() != null ? doctor.getUser().getUserId() : 1L,
                doctorName,
                "DOCTOR",
                newVersion > 1 ? "PRESCRIPTION_MODIFIED_V" + newVersion : "PRESCRIPTION_CREATED_V1",
                "Prescription",
                savedPrescription.getPrescriptionId(),
                String.format("Prescribed %d medicines (v%d) for Patient %s (Visit #%d)",
                        savedPrescription.getItems().size(), newVersion,
                        patient.getUser() != null ? patient.getUser().getName() : "",
                        consultation.getVisit() != null ? consultation.getVisit().getVisitId() : 0)
        );

        // Patient notification
        Notification notification = Notification.builder()
                .patient(patient)
                .message("Dr. " + doctorName + " finalized your prescription (V" + newVersion + "). Pharmacy Queue #" + nextQueuePos + ".")
                .type(Notification.NotificationType.QUEUE_UPDATE)
                .status(Notification.NotificationStatus.UNREAD)
                .build();
        notificationRepository.save(notification);

        return mapToDTO(savedPrescription);
    }

    @Transactional(readOnly = true)
    public MedicationReconciliationDTO getMedicationReconciliation(Long patientId) {
        List<Prescription> allPrescriptions = prescriptionRepository.findByPatient_PatientIdOrderByIssuedAtDesc(patientId);

        List<PrescriptionItemDTO> currentMeds = new ArrayList<>();
        List<PrescriptionItemDTO> previousMeds = new ArrayList<>();
        List<String> duplicateWarnings = new ArrayList<>();
        List<String> safetyAlerts = new ArrayList<>();

        Set<String> activeMedicineNames = new HashSet<>();
        Set<String> activeGenerics = new HashSet<>();

        if (!allPrescriptions.isEmpty()) {
            Prescription latest = allPrescriptions.get(0);
            for (PrescriptionItem item : latest.getItems()) {
                PrescriptionItemDTO itemDTO = mapItemToDTO(item);
                currentMeds.add(itemDTO);

                String medName = item.getMedicine() != null ? item.getMedicine().getName().toLowerCase() : "";
                String genName = item.getMedicine() != null && item.getMedicine().getGenericName() != null ? item.getMedicine().getGenericName().toLowerCase() : "";

                if (activeMedicineNames.contains(medName) || (!genName.isEmpty() && activeGenerics.contains(genName))) {
                    duplicateWarnings.add("Potential duplicate/concurrent therapy detected: " + item.getMedicine().getName() + " (" + genName + ")");
                }
                activeMedicineNames.add(medName);
                if (!genName.isEmpty()) activeGenerics.add(genName);
            }

            for (int i = 1; i < allPrescriptions.size(); i++) {
                for (PrescriptionItem item : allPrescriptions.get(i).getItems()) {
                    previousMeds.add(mapItemToDTO(item));
                }
            }
        }

        if (currentMeds.size() > 4) {
            safetyAlerts.add("Polypharmacy Notice: Patient currently has " + currentMeds.size() + " active prescribed medications. Monitor interactions.");
        }

        return MedicationReconciliationDTO.builder()
                .patientId(patientId)
                .currentMedicines(currentMeds)
                .previousMedicines(previousMeds)
                .duplicateWarnings(duplicateWarnings)
                .safetyAlerts(safetyAlerts)
                .prescriptionHistory(allPrescriptions.stream().map(this::mapToDTO).collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public PrescriptionDTO verifyPrescriptionByClinic(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + prescriptionId));

        prescription.setIsVerifiedByClinic(true);
        Prescription saved = prescriptionRepository.save(prescription);

        auditService.logAction(
                1L,
                "Clinic Pharmacist",
                "PHARMACY",
                "PRESCRIPTION_VERIFIED",
                "Prescription",
                prescriptionId,
                "Verified stock availability for Prescription #" + prescriptionId + " (v" + saved.getVersion() + ")"
        );

        return mapToDTO(saved);
    }

    public PrescriptionDTO getPrescriptionById(Long id) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));
        return mapToDTO(p);
    }

    public PrescriptionDTO getPrescriptionByConsultationId(Long consultationId) {
        List<Prescription> list = prescriptionRepository.findByConsultation_ConsultationIdOrderByVersionDesc(consultationId);
        if (list.isEmpty()) {
            throw new ResourceNotFoundException("Prescription not found for consultation: " + consultationId);
        }
        return mapToDTO(list.get(0));
    }

    public List<PrescriptionDTO> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatient_PatientIdOrderByIssuedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getActivePrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatient_PatientIdAndIsLatestActiveTrue(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO mapToDTO(Prescription p) {
        List<PrescriptionItemDTO> items = p.getItems().stream()
                .map(this::mapItemToDTO)
                .collect(Collectors.toList());

        boolean allAvailable = true;
        boolean anyAvailable = false;

        for (PrescriptionItemDTO it : items) {
            if (it.getAvailableStock() != null && it.getAvailableStock() >= (it.getPrescribedQuantity() != null ? it.getPrescribedQuantity() : 1)) {
                anyAvailable = true;
            } else {
                allAvailable = false;
            }
        }

        String verificationStatus;
        if (!Boolean.TRUE.equals(p.getIsVerifiedByClinic())) {
            verificationStatus = "PENDING_VERIFICATION";
        } else if (allAvailable) {
            verificationStatus = "VERIFIED_IN_STOCK";
        } else if (anyAvailable) {
            verificationStatus = "PARTIALLY_AVAILABLE";
        } else {
            verificationStatus = "OUT_OF_STOCK";
        }

        return PrescriptionDTO.builder()
                .prescriptionId(p.getPrescriptionId())
                .consultationId(p.getConsultation() != null ? p.getConsultation().getConsultationId() : null)
                .patientId(p.getPatient() != null ? p.getPatient().getPatientId() : null)
                .patientName(p.getPatient() != null && p.getPatient().getUser() != null ? p.getPatient().getUser().getName() : "")
                .doctorId(p.getDoctor() != null ? p.getDoctor().getDoctorId() : null)
                .doctorName(p.getDoctor() != null && p.getDoctor().getUser() != null ? p.getDoctor().getUser().getName() : "")
                .issuedAt(p.getIssuedAt())
                .status(p.getStatus())
                .version(p.getVersion() != null ? p.getVersion() : 1)
                .isLatestActive(p.getIsLatestActive())
                .previousPrescriptionId(p.getPreviousPrescriptionId())
                .isVerifiedByClinic(p.getIsVerifiedByClinic())
                .verificationStatus(verificationStatus)
                .instructions(p.getInstructions())
                .items(items)
                .build();
    }

    private PrescriptionItemDTO mapItemToDTO(PrescriptionItem item) {
        Integer availableStock = 0;
        Double price = 15.0;
        if (item.getMedicine() != null) {
            availableStock = medicineInventoryRepository.findTotalAvailableQuantity(item.getMedicine().getMedicineId());
            if (availableStock == null) availableStock = 0;
            if (item.getMedicine().getPrice() != null) {
                price = item.getMedicine().getPrice().doubleValue();
            }
        }

        int prescribed = item.getPrescribedQuantity() != null ? item.getPrescribedQuantity() : (item.getQuantity() != null ? item.getQuantity() : 0);
        int dispensed = item.getDispensedQuantity() != null ? item.getDispensedQuantity() : 0;
        int reserved = item.getReservedQuantity() != null ? item.getReservedQuantity() : 0;
        int remaining = Math.max(0, prescribed - dispensed);

        String stockStatus = "IN_STOCK";
        if (availableStock == 0) {
            stockStatus = "OUT_OF_STOCK";
        } else if (availableStock < remaining) {
            stockStatus = "PARTIAL_STOCK";
        }

        return PrescriptionItemDTO.builder()
                .prescriptionItemId(item.getPrescriptionItemId())
                .medicineId(item.getMedicine() != null ? item.getMedicine().getMedicineId() : null)
                .medicineName(item.getMedicine() != null ? item.getMedicine().getName() : "")
                .genericName(item.getMedicine() != null ? item.getMedicine().getGenericName() : "")
                .dosage(item.getDosage())
                .frequency(item.getFrequency())
                .timing(item.getTiming())
                .durationDays(item.getDurationDays())
                .quantity(item.getQuantity())
                .prescribedQuantity(prescribed)
                .dispensedQuantity(dispensed)
                .reservedQuantity(reserved)
                .remainingQuantity(remaining)
                .availableStock(availableStock)
                .stockStatus(stockStatus)
                .unitPrice(price)
                .instructions(item.getInstructions())
                .build();
    }
}
