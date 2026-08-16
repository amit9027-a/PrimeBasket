package com.stlabs.ecommerce.auth.service;

import com.stlabs.ecommerce.auth.dto.AuthResponse;
import com.stlabs.ecommerce.auth.dto.LoginRequest;
import com.stlabs.ecommerce.auth.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
