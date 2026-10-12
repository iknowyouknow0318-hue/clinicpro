package com.clinicflow.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email, String role, Long userId, Long clinicId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("userId", userId)
                .claim("clinicId", clinicId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /** Backward-compatible overload without clinicId */
    public String generateToken(String email, String role, Long userId) {
        return generateToken(email, role, userId, null);
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public String getRoleFromToken(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().get("role", String.class);
    }

    public Long getUserIdFromToken(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().get("userId", Long.class);
    }

    public Long getClinicIdFromToken(String token) {
        Object raw = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().get("clinicId");
        if (raw == null) return null;
        if (raw instanceof Long l) return l;
        if (raw instanceof Integer i) return i.longValue();
        return Long.parseLong(raw.toString());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
