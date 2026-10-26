package com.stlabs.ecommerce.auth.service;

import com.stlabs.ecommerce.auth.dto.AuthResponse;
import com.stlabs.ecommerce.auth.dto.LoginRequest;
import com.stlabs.ecommerce.auth.dto.RegisterRequest;
import com.stlabs.ecommerce.auth.dto.SendOtpRequest;
import com.stlabs.ecommerce.auth.dto.VerifyOtpRequest;

public interface AuthService {

    void sendRegistrationOtp(SendOtpRequest request);

    AuthResponse verifyRegistrationOtp(VerifyOtpRequest request);

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}