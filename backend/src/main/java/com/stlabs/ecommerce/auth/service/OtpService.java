package com.stlabs.ecommerce.auth.service;

import com.stlabs.ecommerce.otp.EmailOtp;
import com.stlabs.ecommerce.otp.repository.EmailOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_EXPIRY_MINUTES = 10;

    private static final int MAX_ATTEMPTS = 5;

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;

    private final SecureRandom secureRandom =
            new SecureRandom();

    public void sendOtp(String email) {

        String otp = generateOtp();

        emailOtpRepository.deleteByEmail(email);

        String otpHash = hashOtp(otp);

        EmailOtp emailOtp = new EmailOtp(
                email,
                otpHash,
                Instant.now().plus(
                        OTP_EXPIRY_MINUTES,
                        ChronoUnit.MINUTES
                ),
                Instant.now()
        );

        emailOtpRepository.save(emailOtp);

        try {

            emailService.sendRegistrationOtp(
                    email,
                    otp
            );

        } catch (RuntimeException exception) {

            emailOtpRepository.deleteByEmail(email);

            throw exception;
        }
    }

    public void verifyOtp(
            String email,
            String otp
    ) {

        EmailOtp emailOtp =
                emailOtpRepository
                        .findTopByEmailOrderByCreatedAtDesc(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "OTP not found. Please request a new OTP."
                                )
                        );

        if (Instant.now().isAfter(
                emailOtp.getExpiresAt()
        )) {

            emailOtpRepository.delete(emailOtp);

            throw new IllegalArgumentException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (emailOtp.getAttempts() >= MAX_ATTEMPTS) {

            emailOtpRepository.delete(emailOtp);

            throw new IllegalArgumentException(
                    "Too many incorrect OTP attempts. Please request a new OTP."
            );
        }

        String providedHash =
                hashOtp(otp);

        if (!MessageDigest.isEqual(
                providedHash.getBytes(StandardCharsets.UTF_8),
                emailOtp.getOtpHash()
                        .getBytes(StandardCharsets.UTF_8)
        )) {

            emailOtp.setAttempts(
                    emailOtp.getAttempts() + 1
            );

            emailOtpRepository.save(emailOtp);

            throw new IllegalArgumentException(
                    "Invalid OTP"
            );
        }

        emailOtpRepository.delete(emailOtp);
    }

    private String generateOtp() {

        int number =
                secureRandom.nextInt(1_000_000);

        return String.format(
                "%06d",
                number
        );
    }

    private String hashOtp(String otp) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            otp.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat.of().formatHex(hash);

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Unable to process OTP",
                    exception
            );
        }
    }
}