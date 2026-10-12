package com.clinicflow.repository;

import com.clinicflow.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient_PatientId(Long patientId);
    List<Appointment> findByPatient_PatientIdOrderByScheduledAtDesc(Long patientId);
    List<Appointment> findByDoctor_DoctorId(Long doctorId);
    List<Appointment> findByDoctor_DoctorIdOrderByScheduledAtAsc(Long doctorId);
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    List<Appointment> findByClinic_ClinicId(Long clinicId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.doctorId = :doctorId " +
           "AND a.scheduledAt BETWEEN :start AND :end ORDER BY a.scheduledAt")
    List<Appointment> findByDoctorAndDateRange(Long doctorId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.scheduledAt BETWEEN :start AND :end ORDER BY a.scheduledAt")
    List<Appointment> findByDateRange(LocalDateTime start, LocalDateTime end);

    List<Appointment> findByDoctor_DoctorIdAndScheduledAtBetweenAndStatusNotInOrderByScheduledAtAsc(
            Long doctorId, LocalDateTime start, LocalDateTime end, Collection<Appointment.AppointmentStatus> statuses);

    boolean existsByDoctor_DoctorIdAndScheduledAtAndStatusNotIn(
            Long doctorId, LocalDateTime scheduledAt, Collection<Appointment.AppointmentStatus> statuses);

    boolean existsByDoctor_DoctorIdAndScheduledAtAndAppointmentIdNotAndStatusNotIn(
            Long doctorId, LocalDateTime scheduledAt, Long appointmentId, Collection<Appointment.AppointmentStatus> statuses);
}
