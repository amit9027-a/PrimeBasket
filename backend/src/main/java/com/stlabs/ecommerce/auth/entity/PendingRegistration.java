package com.stlabs.ecommerce.auth.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "pending_registrations",
        indexes = {
                @Index(
                        name = "idx_pending_registration_email",
                        columnList = "email",
                        unique = true
                )
        }
)
public class PendingRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String encodedPassword;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public PendingRegistration() {
        this.createdAt = Instant.now();
    }

    public PendingRegistration(
            String firstName,
            String lastName,
            String email,
            String encodedPassword,
            Instant createdAt
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.encodedPassword = encodedPassword;
        this.createdAt = createdAt != null
                ? createdAt
                : Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getEncodedPassword() {
        return encodedPassword;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setEncodedPassword(String encodedPassword) {
        this.encodedPassword = encodedPassword;
    }
}