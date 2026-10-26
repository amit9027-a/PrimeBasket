package com.stlabs.ecommerce.auth.controller;

import com.stlabs.ecommerce.auth.dto.AuthResponse;
import com.stlabs.ecommerce.auth.dto.LoginRequest;
import com.stlabs.ecommerce.auth.dto.RegisterRequest;
import com.stlabs.ecommerce.auth.dto.SendOtpRequest;
import com.stlabs.ecommerce.auth.dto.VerifyOtpRequest;
import com.stlabs.ecommerce.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(
        name = "Authentication",
        description = "Registration, OTP verification and login endpoints"
)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/send-otp")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Send registration OTP"
    )
    public String sendRegistrationOtp(
            @Valid @RequestBody SendOtpRequest request
    ) {

        authService.sendRegistrationOtp(request);

        return "OTP sent successfully to your email";
    }

    @PostMapping("/register/verify-otp")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Verify registration OTP and create account"
    )
    public AuthResponse verifyRegistrationOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {

        return authService.verifyRegistrationOtp(
                request
        );
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Legacy registration endpoint"
    )
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {

        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(
            summary = "Login and receive a JWT access token"
    )
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request
    ) {

        return authService.login(request);
    }
}