package com.stlabs.ecommerce.auth.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(buildJsonResponse(
                HttpStatus.UNAUTHORIZED,
                "Authentication is required to access this resource",
                request.getRequestURI()
        ));
    }

    private String buildJsonResponse(HttpStatus status, String message, String path) {
        return """
                {"timestamp":"%s","status":%d,"error":"%s","message":"%s","path":"%s"}
                """.formatted(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path
        ).trim();
    }
}
