
package com.stlabs.ecommerce;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.stlabs.ecommerce.auth.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

@SpringBootTest
class AuthAndDocsIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private EmailService emailService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void registerAndLoginFlowWorks() throws Exception {
        String email = "aman.student."
                + UUID.randomUUID()
                + "@example.com";

        String sendOtpPayload = """
                {
                  "firstName": "Aman",
                  "lastName": "Student",
                  "email": "%s",
                  "password": "Password@123"
                }
                """.formatted(email);

        // Request an OTP. EmailService is mocked, so no real email is sent.
        mockMvc.perform(post("/api/v1/auth/register/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sendOtpPayload))
                .andExpect(status().isOk());

        // Capture the OTP passed to the mocked email service.
        ArgumentCaptor<String> otpCaptor =
                ArgumentCaptor.forClass(String.class);

        verify(emailService).sendRegistrationOtp(
                eq(email),
                otpCaptor.capture()
        );

        String otp = otpCaptor.getValue();

        String verifyOtpPayload = """
                {
                  "email": "%s",
                  "otp": "%s"
                }
                """.formatted(email, otp);

        // Verify the OTP and create the customer account.
        mockMvc.perform(post("/api/v1/auth/register/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verifyOtpPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"));

        String loginPayload = """
                {
                  "email": "%s",
                  "password": "Password@123"
                }
                """.formatted(email);

        // Verify that the newly registered user can log in.
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void openApiDocsEndpointIsAvailable() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("E-Commerce API"));
    }
}
