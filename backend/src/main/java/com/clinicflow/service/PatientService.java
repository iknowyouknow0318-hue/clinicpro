package com.clinicflow.service;

import com.clinicflow.dto.PatientDTO;
import com.clinicflow.entity.Clinic;
import com.clinicflow.entity.Patient;
import com.clinicflow.entity.User;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.ClinicRepository;
import com.clinicflow.repository.PatientRepository;
import com.clinicflow.repository.UserRepository;
import com.clinicflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ClinicRepository clinicRepository;

    /**
     * Clinic-scoped: returns only patients belonging to the authenticated user's clinic.
     * If no clinic scope is present (e.g., ADMIN token without clinic), falls back to all patients.
     */
    public List<PatientDTO> getAllPatients() {
        Long clinicId = SecurityUtils.getCurrentClinicId();
        if (clinicId != null) {
            return patientRepository.findByClinic_ClinicId(clinicId).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        return patientRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return mapToDTO(patient);
    }

    public PatientDTO getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + userId));
        return mapToDTO(patient);
    }

    @Transactional
    public PatientDTO createPatient(PatientDTO dto) {
        // Determine the clinic from the authenticated user's token, then fall back to dto.clinicId, then default
        Long clinicId = SecurityUtils.getCurrentClinicId();
        Clinic clinic = null;
        if (clinicId != null) {
            clinic = clinicRepository.findById(clinicId).orElse(null);
        }
        if (clinic == null && dto.getClinicId() != null) {
            clinic = clinicRepository.findById(dto.getClinicId()).orElse(null);
        }
        if (clinic == null) {
            clinic = clinicRepository.findAll().stream().findFirst().orElse(null);
        }

        User user = null;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId()).orElse(null);
        }

        if (user == null) {
            // Auto-create basic user account for patient registered by reception staff
            String email = dto.getEmail() != null && !dto.getEmail().isBlank()
                    ? dto.getEmail()
                    : "patient" + System.currentTimeMillis() + "@clinic.local";
            user = User.builder()
                    .name(dto.getName())
                    .email(email)
                    .phone(dto.getPhone() != null ? dto.getPhone() : "")
                    .passwordHash("$2a$10$e8p.g10c3vQ7wV/lPskfGOMr5v5V.74d81mZ1H5J5mS9Jz/x91y9O")
                    .role(User.Role.PATIENT)
                    .clinic(clinic)
                    .accountStatus(User.AccountStatus.ACTIVE)
                    .build();
            user = userRepository.save(user);
        }

        final Clinic finalClinic = clinic;
        Patient patient = Patient.builder()
                .user(user)
                .clinic(finalClinic)
                .dob(dto.getDob())
                .gender(dto.getGender() != null ? dto.getGender() : Patient.Gender.OTHER)
                .bloodGroup(dto.getBloodGroup())
                .address(dto.getAddress())
                .build();

        Patient saved = patientRepository.save(patient);
        return mapToDTO(saved);
    }

    @Transactional
    public PatientDTO updatePatient(Long id, PatientDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        if (dto.getDob() != null) patient.setDob(dto.getDob());
        if (dto.getGender() != null) patient.setGender(dto.getGender());
        if (dto.getBloodGroup() != null) patient.setBloodGroup(dto.getBloodGroup());
        if (dto.getAddress() != null) patient.setAddress(dto.getAddress());

        if (patient.getUser() != null) {
            if (dto.getName() != null && !dto.getName().isBlank()) patient.getUser().setName(dto.getName());
            if (dto.getPhone() != null && !dto.getPhone().isBlank()) patient.getUser().setPhone(dto.getPhone());
            userRepository.save(patient.getUser());
        }

        return mapToDTO(patientRepository.save(patient));
    }

    public PatientDTO mapToDTO(Patient p) {
        return PatientDTO.builder()
                .patientId(p.getPatientId())
                .userId(p.getUser() != null ? p.getUser().getUserId() : null)
                .clinicId(p.getClinic() != null ? p.getClinic().getClinicId() : null)
                .name(p.getUser() != null ? p.getUser().getName() : "")
                .email(p.getUser() != null ? p.getUser().getEmail() : "")
                .phone(p.getUser() != null ? p.getUser().getPhone() : "")
                .dob(p.getDob())
                .gender(p.getGender())
                .bloodGroup(p.getBloodGroup())
                .address(p.getAddress())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
