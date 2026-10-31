
package com.stlabs.ecommerce.auth.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;

import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Properties;

@Service
public class EmailService {

    private static final GsonFactory JSON_FACTORY =
            GsonFactory.getDefaultInstance();

    private static final String APPLICATION_NAME =
            "PrimeBasket Gmail OTP";

    @Value("${gmail.oauth.credentials-path:${user.dir}/gmail-oauth/credentials.json}")
    private String credentialsPath;

    @Value("${GMAIL_OAUTH_REFRESH_TOKEN:}")
    private String configuredRefreshToken;

    @Value("${gmail.sender:}")
    private String configuredSenderEmail;

    public void sendRegistrationOtp(String toEmail, String otp) {
        try {
            Gmail gmail = getGmailService();
            String senderEmail = getSenderEmail();

            if (senderEmail.isBlank()) {
                throw new IllegalStateException(
                        "Gmail sender email is not configured. "
                        + "Set GMAIL_SENDER."
                );
            }

            String subject = "PrimeBasket - Email Verification OTP";

            String body =
                    "Hello,\n\n"
                    + "Welcome to PrimeBasket!\n\n"
                    + "Your email verification OTP is:\n\n"
                    + otp + "\n\n"
                    + "This OTP is valid for 10 minutes.\n"
                    + "Please do not share this OTP with anyone.\n\n"
                    + "If you did not create a PrimeBasket account, "
                    + "you can safely ignore this email.\n\n"
                    + "Regards,\n"
                    + "PrimeBasket Team";

            MimeMessage email = createEmail(
                    toEmail, senderEmail, subject, body
            );

            Message message = createGmailMessage(email);

            gmail.users()
                    .messages()
                    .send("me", message)
                    .execute();

            System.out.println(
                    "PrimeBasket OTP email sent successfully to: "
                            + toEmail
            );

        } catch (Exception exception) {
            // Do not log credentials, access tokens, or refresh tokens.
            System.err.println(
                    "Failed to send PrimeBasket OTP email: "
                            + exception.getClass().getSimpleName()
                            + ": " + exception.getMessage()
            );

            throw new IllegalStateException(
                    "Unable to send OTP email. Please check the backend logs.",
                    exception
            );
        }
    }

    private Gmail getGmailService() throws Exception {
        File credentialsFile = new File(credentialsPath);

        if (!credentialsFile.isFile()) {
            throw new IllegalStateException(
                    "Google OAuth credentials file not found: "
                            + credentialsFile.getAbsolutePath()
            );
        }

        if (configuredRefreshToken == null
                || configuredRefreshToken.isBlank()) {
            throw new IllegalStateException(
                    "GMAIL_OAUTH_REFRESH_TOKEN environment variable "
                            + "is not configured."
            );
        }

        GoogleClientSecrets clientSecrets;

        try (FileReader reader = new FileReader(
                credentialsFile, StandardCharsets.UTF_8)) {
            clientSecrets = GoogleClientSecrets.load(
                    JSON_FACTORY, reader
            );
        }

        String clientId = clientSecrets.getDetails().getClientId();
        String clientSecret = clientSecrets.getDetails().getClientSecret();

        if (clientId == null || clientId.isBlank()
                || clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalStateException(
                    "Google OAuth client ID or client secret is missing "
                            + "from credentials.json."
            );
        }

        UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(configuredRefreshToken.trim())
                .build();

        return new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                new HttpCredentialsAdapter(credentials)
        )
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    private String getSenderEmail() {
        return configuredSenderEmail == null
                ? ""
                : configuredSenderEmail.trim();
    }

    private MimeMessage createEmail(
            String to,
            String from,
            String subject,
            String body
    ) throws Exception {
        Session session = Session.getInstance(new Properties());

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(from));
        email.setRecipient(
                jakarta.mail.Message.RecipientType.TO,
                new InternetAddress(to)
        );
        email.setSubject(subject, StandardCharsets.UTF_8.name());
        email.setText(body, StandardCharsets.UTF_8.name());

        return email;
    }

    private Message createGmailMessage(MimeMessage email)
            throws Exception {
        byte[] rawBytes;

        try (java.io.ByteArrayOutputStream buffer =
                     new java.io.ByteArrayOutputStream()) {
            email.writeTo(buffer);
            rawBytes = buffer.toByteArray();
        }

        String encodedEmail = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(rawBytes);

        Message message = new Message();
        message.setRaw(encodedEmail);

        return message;
    }
}
