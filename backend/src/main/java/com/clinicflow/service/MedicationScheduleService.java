package com.clinicflow.service;

import com.clinicflow.dto.MedicationScheduleDTO;
import com.clinicflow.entity.MedicationSchedule;
import com.clinicflow.entity.Prescription;
import com.clinicflow.entity.PrescriptionItem;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.MedicationScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationScheduleService {

    private final MedicationScheduleRepository medicationScheduleRepository;
    private final AuditService auditService;

    @Transactional
    public void generateScheduleForPrescription(Prescription prescription) {
        if (prescription == null || prescription.getItems() == null || prescription.getItems().isEmpty()) {
            return;
        }

        LocalDate startDate = LocalDate.now();
        List<MedicationSchedule> schedulesToSave = new ArrayList<>();

        for (PrescriptionItem item : prescription.getItems()) {
            int durationDays = (item.getDurationDays() != null && item.getDurationDays() > 0) ? item.getDurationDays() : 7;
            int daysToGenerate = Math.min(durationDays, 7); // generate active 7 days

            List<String> dailyTimes = parseFrequencyToTimes(item.getFrequency(), item.getTiming());

            for (int d = 0; d < daysToGenerate; d++) {
                LocalDate scheduleDate = startDate.plusDays(d);
                for (String timeLabel : dailyTimes) {
                    MedicationSchedule schedule = MedicationSchedule.builder()
                            .patient(prescription.getPatient())
                            .prescription(prescription)
                            .prescriptionItem(item)
                            .medicineName(item.getMedicine() != null ? item.getMedicine().getName() : "Medicine")
                            .dosage(item.getDosage())
                            .frequency(item.getFrequency())
                            .timing(item.getTiming() != null ? item.getTiming() : timeLabel)
                            .scheduledDate(scheduleDate)
                            .scheduledTime(timeLabel)
                            .status(MedicationSchedule.AdherenceStatus.SCHEDULED)
                            .build();
                    schedulesToSave.add(schedule);
                }
            }
        }

        medicationScheduleRepository.saveAll(schedulesToSave);
        log.info("Generated {} medication schedule slots for Prescription #{}", schedulesToSave.size(), prescription.getPrescriptionId());
    }

    private List<String> parseFrequencyToTimes(String freq, String timing) {
        List<String> times = new ArrayList<>();
        String normalized = (freq != null ? freq.trim().toUpperCase() : "") + " " + (timing != null ? timing.trim().toUpperCase() : "");

        if (normalized.contains("1-1-1") || normalized.contains("THRICE") || normalized.contains("TID") || normalized.contains("3 TIMES")) {
            times.add("08:00 AM (Morning)");
            times.add("01:00 PM (Afternoon)");
            times.add("08:00 PM (Night)");
        } else if (normalized.contains("1-0-1") || normalized.contains("TWICE") || normalized.contains("BID") || normalized.contains("2 TIMES")) {
            times.add("08:00 AM (Morning)");
            times.add("08:00 PM (Night)");
        } else if (normalized.contains("0-0-1") || normalized.contains("NIGHT") || normalized.contains("BEDTIME") || normalized.contains("HS")) {
            times.add("09:00 PM (Night)");
        } else if (normalized.contains("0-1-0") || normalized.contains("AFTERNOON")) {
            times.add("01:30 PM (Afternoon)");
        } else {
            // Default 1-0-0 or Once daily
            times.add("08:30 AM (Morning)");
        }
        return times;
    }

    @Transactional(readOnly = true)
    public List<MedicationScheduleDTO> getTodaySchedule(Long patientId) {
        LocalDate today = LocalDate.now();
        return medicationScheduleRepository.findByPatient_PatientIdAndScheduledDateOrderByScheduledTimeAsc(patientId, today)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicationScheduleDTO> getMedicationHistory(Long patientId) {
        return medicationScheduleRepository.findByPatient_PatientIdOrderByScheduledDateDescScheduledTimeAsc(patientId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicationScheduleDTO recordAdherence(Long scheduleId, MedicationSchedule.AdherenceStatus status, String notes, Long userId, String userName) {
        MedicationSchedule schedule = medicationScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication schedule not found with id: " + scheduleId));

        schedule.setStatus(status);
        schedule.setActionTimestamp(LocalDateTime.now());
        if (notes != null && !notes.isBlank()) {
            schedule.setNotes(notes);
        }

        MedicationSchedule updated = medicationScheduleRepository.save(schedule);

        auditService.logAction(
                userId,
                userName,
                "PATIENT",
                "MEDICATION_DOSE_" + status.name(),
                "MedicationSchedule",
                scheduleId,
                String.format("Patient marked %s as %s for %s (%s)",
                        updated.getMedicineName(), status.name(), updated.getScheduledDate(), updated.getScheduledTime())
        );

        return mapToDTO(updated);
    }

    private MedicationScheduleDTO mapToDTO(MedicationSchedule entity) {
        return MedicationScheduleDTO.builder()
                .scheduleId(entity.getScheduleId())
                .patientId(entity.getPatient() != null ? entity.getPatient().getPatientId() : null)
                .prescriptionId(entity.getPrescription() != null ? entity.getPrescription().getPrescriptionId() : null)
                .prescriptionItemId(entity.getPrescriptionItem() != null ? entity.getPrescriptionItem().getPrescriptionItemId() : null)
                .medicineName(entity.getMedicineName())
                .dosage(entity.getDosage())
                .frequency(entity.getFrequency())
                .timing(entity.getTiming())
                .scheduledDate(entity.getScheduledDate())
                .scheduledTime(entity.getScheduledTime())
                .status(entity.getStatus())
                .actionTimestamp(entity.getActionTimestamp())
                .notes(entity.getNotes())
                .build();
    }
}
