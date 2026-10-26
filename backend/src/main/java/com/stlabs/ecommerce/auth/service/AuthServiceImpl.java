package com.stlabs.ecommerce.auth.service;

import com.stlabs.ecommerce.auth.dto.AuthResponse;
import com.stlabs.ecommerce.auth.dto.LoginRequest;
import com.stlabs.ecommerce.auth.dto.RegisterRequest;
import com.stlabs.ecommerce.auth.dto.SendOtpRequest;
import com.stlabs.ecommerce.auth.dto.VerifyOtpRequest;
import com.stlabs.ecommerce.auth.entity.PendingRegistration;
import com.stlabs.ecommerce.auth.repository.PendingRegistrationRepository;
import com.stlabs.ecommerce.auth.security.AuthenticatedUser;
import com.stlabs.ecommerce.auth.security.JwtService;
import com.stlabs.ecommerce.auth.security.SecurityConstants;
import com.stlabs.ecommerce.exception.EmailAlreadyExistsException;
import com.stlabs.ecommerce.role.entity.Role;
import com.stlabs.ecommerce.role.repository.RoleRepository;
import com.stlabs.ecommerce.user.dto.UserResponse;
import com.stlabs.ecommerce.user.entity.User;
import com.stlabs.ecommerce.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final OtpService otpService;

    @Override
    @Transactional
    public void sendRegistrationOtp(
            SendOtpRequest request
    ) {

        String normalizedEmail =
                normalizeEmail(request.email());

        if (userRepository.existsByEmail(
                normalizedEmail
        )) {

            throw new EmailAlreadyExistsException(
                    "Email is already registered"
            );
        }

        PendingRegistration pending =
                pendingRegistrationRepository
                        .findByEmail(normalizedEmail)
                        .orElseGet(
                                PendingRegistration::new
                        );

        pending.setFirstName(
                request.firstName().trim()
        );

        pending.setLastName(
                request.lastName().trim()
        );

        pending.setEmail(normalizedEmail);

        pending.setEncodedPassword(
                passwordEncoder.encode(
                        request.password()
                )
        );

        pendingRegistrationRepository.save(pending);

        otpService.sendOtp(normalizedEmail);
    }

    @Override
    @Transactional
    public AuthResponse verifyRegistrationOtp(
            VerifyOtpRequest request
    ) {

        String normalizedEmail =
                normalizeEmail(request.email());

        PendingRegistration pending =
                pendingRegistrationRepository
                        .findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Registration request not found. Please request OTP again."
                                )
                        );

        otpService.verifyOtp(
                normalizedEmail,
                request.otp()
        );

        if (userRepository.existsByEmail(
                normalizedEmail
        )) {

            pendingRegistrationRepository
                    .delete(pending);

            throw new EmailAlreadyExistsException(
                    "Email is already registered"
            );
        }

        Role customerRole =
                roleRepository
                        .findByName(
                                SecurityConstants.ROLE_CUSTOMER
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Customer role is not configured"
                                )
                        );

        User user = new User();

        user.setFirstName(
                pending.getFirstName()
        );

        user.setLastName(
                pending.getLastName()
        );

        user.setEmail(
                normalizedEmail
        );

        user.setPassword(
                pending.getEncodedPassword()
        );

        user.setRole(customerRole);

        User savedUser =
                userRepository.save(user);

        pendingRegistrationRepository
                .delete(pending);

        AuthenticatedUser authenticatedUser =
                new AuthenticatedUser(savedUser);

        return buildAuthResponse(
                savedUser,
                authenticatedUser
        );
    }

    @Override
    @Transactional
    public AuthResponse register(
            RegisterRequest request
    ) {

        throw new IllegalArgumentException(
                "Direct registration is disabled. Please verify your email with OTP."
        );
    }

    @Override
    public AuthResponse login(
            LoginRequest request
    ) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                normalizeEmail(request.email()),
                                request.password()
                        )
                );

        AuthenticatedUser authenticatedUser =
                (AuthenticatedUser)
                        authentication.getPrincipal();

        return buildAuthResponse(
                authenticatedUser.getUser(),
                authenticatedUser
        );
    }

    private AuthResponse buildAuthResponse(
            User user,
            AuthenticatedUser authenticatedUser
    ) {

        return new AuthResponse(
                jwtService.generateToken(
                        authenticatedUser
                ),
                "Bearer",
                jwtService.getJwtExpirationMs() / 1000,
                UserResponse.from(user)
        );
    }

    private String normalizeEmail(
            String email
    ) {

        return email
                .trim()
                .toLowerCase();
    }
}