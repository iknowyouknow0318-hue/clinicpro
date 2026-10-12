package com.clinicflow.service;

import com.clinicflow.dto.ClinicDTO;
import com.clinicflow.entity.Clinic;
import com.clinicflow.exception.BadRequestException;
import com.clinicflow.exception.DuplicateResourceException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.repository.ClinicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicService {

    private final ClinicRepository clinicRepository;

    @Transactional
    public ClinicDTO createClinic(ClinicDTO dto) {
        if (dto.getClinicName() == null || dto.getClinicName().trim().isEmpty()) {
            throw new BadRequestException("Clinic name is required");
        }
        if (dto.getClinicIdentifier() == null || dto.getClinicIdentifier().trim().isEmpty()) {
            throw new BadRequestException("Clinic identifier is required");
        }
        if (clinicRepository.existsByClinicIdentifier(dto.getClinicIdentifier().trim())) {
            throw new DuplicateResourceException("Clinic with identifier '" + dto.getClinicIdentifier() + "' already exists");
        }

        Clinic clinic = Clinic.builder()
                .clinicName(dto.getClinicName().trim())
                .clinicIdentifier(dto.getClinicIdentifier().trim().toUpperCase())
                .contactInformation(dto.getContactInformation())
                .address(dto.getAddress())
                .status(dto.getStatus() != null ? Clinic.Status.valueOf(dto.getStatus().toUpperCase()) : Clinic.Status.ACTIVE)
                .build();

        clinic = clinicRepository.save(clinic);
        return mapToDto(clinic);
    }

    public List<ClinicDTO> getAllClinics() {
        return clinicRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ClinicDTO> getActiveClinics() {
        return clinicRepository.findByStatus(Clinic.Status.ACTIVE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ClinicDTO getClinicById(Long clinicId) {
        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("Clinic not found with id: " + clinicId));
        return mapToDto(clinic);
    }

    public ClinicDTO getClinicByIdentifier(String identifier) {
        Clinic clinic = clinicRepository.findByClinicIdentifier(identifier.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Clinic not found with identifier: " + identifier));
        return mapToDto(clinic);
    }

    public ClinicDTO mapToDto(Clinic clinic) {
        return ClinicDTO.builder()
                .clinicId(clinic.getClinicId())
                .clinicName(clinic.getClinicName())
                .clinicIdentifier(clinic.getClinicIdentifier())
                .contactInformation(clinic.getContactInformation())
                .address(clinic.getAddress())
                .status(clinic.getStatus().name())
                .createdAt(clinic.getCreatedAt())
                .updatedAt(clinic.getUpdatedAt())
                .build();
    }
}
