package com.stlabs.ecommerce.otp;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "email_otps",
        indexes = {
                @Index(name = "idx_email_otp_email", columnList = "email")
        }
)
public class EmailOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 64)
    private String otpHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private int attempts;

    public EmailOtp() {
    }

    public EmailOtp(
            String email,
            String otpHash,
            Instant expiresAt,
            Instant createdAt
    ) {
        this.email = email;
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.attempts = 0;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }
}