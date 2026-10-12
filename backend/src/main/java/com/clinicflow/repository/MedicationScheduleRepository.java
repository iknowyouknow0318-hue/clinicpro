package com.clinicflow.repository;

import com.clinicflow.entity.MedicationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, Long> {
    List<MedicationSchedule> findByPatient_PatientIdAndScheduledDateOrderByScheduledTimeAsc(Long patientId, LocalDate scheduledDate);
    List<MedicationSchedule> findByPatient_PatientIdOrderByScheduledDateDescScheduledTimeAsc(Long patientId);
    List<MedicationSchedule> findByPrescription_PrescriptionId(Long prescriptionId);
    void deleteByPrescription_PrescriptionId(Long prescriptionId);
}
