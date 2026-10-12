package com.clinicflow.service;

import com.clinicflow.dto.AuditLogDTO;
import com.clinicflow.entity.AuditLog;
import com.clinicflow.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(Long userId, String userName, String userRole, String action, String entityType, Long entityId, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .userName(userName)
                    .userRole(userRole)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
            log.info("[AUDIT] User: {} ({}) | Action: {} | Entity: {} #{} | Details: {}",
                    userName, userRole, action, entityType, entityId, details);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLogDTO> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAuditLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private AuditLogDTO mapToDTO(AuditLog log) {
        return AuditLogDTO.builder()
                .auditLogId(log.getAuditLogId())
                .userId(log.getUserId())
                .userName(log.getUserName())
                .userRole(log.getUserRole())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .timestamp(log.getTimestamp())
                .build();
    }
}
