package com.clinicflow.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility to extract authenticated identity from the security context.
 *
 * Usage in services/controllers:
 *   Long clinicId = SecurityUtils.getCurrentClinicId();
 *   Long userId   = SecurityUtils.getCurrentUserId();
 *   String role   = SecurityUtils.getCurrentRole();
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    private static ClinicAwarePrincipal getPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof ClinicAwarePrincipal)) {
            return null;
        }
        return (ClinicAwarePrincipal) auth.getPrincipal();
    }

    public static Long getCurrentUserId() {
        ClinicAwarePrincipal p = getPrincipal();
        return p != null ? p.getUserId() : null;
    }

    public static Long getCurrentClinicId() {
        ClinicAwarePrincipal p = getPrincipal();
        return p != null ? p.getClinicId() : null;
    }

    public static String getCurrentRole() {
        ClinicAwarePrincipal p = getPrincipal();
        return p != null ? p.getRole() : null;
    }

    public static String getCurrentEmail() {
        ClinicAwarePrincipal p = getPrincipal();
        return p != null ? p.getEmail() : null;
    }

    /** True when the authenticated user belongs to the given clinic. */
    public static boolean isCurrentClinic(Long clinicId) {
        Long c = getCurrentClinicId();
        return c != null && c.equals(clinicId);
    }
}
