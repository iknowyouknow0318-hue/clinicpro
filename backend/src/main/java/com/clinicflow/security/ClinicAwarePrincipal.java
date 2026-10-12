package com.clinicflow.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Clinic-aware principal stored in SecurityContext.
 * Carries userId, clinicId, role derived from the JWT token —
 * so the backend NEVER trusts frontend-provided clinic/user identity.
 */
@Getter
@AllArgsConstructor
public class ClinicAwarePrincipal {
    private final String email;
    private final Long userId;
    private final Long clinicId;
    private final String role;

    @Override
    public String toString() {
        return email;
    }
}
