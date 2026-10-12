package com.clinicflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Long auditLogId;
    private Long userId;
    private String userName;
    private String userRole;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private LocalDateTime timestamp;
}
