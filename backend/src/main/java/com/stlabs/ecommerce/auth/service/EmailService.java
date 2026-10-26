
package com.stlabs.ecommerce.auth.service;

import com.google.api.client.auth.oauth2.StoredCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.util.store.DataStore;
import com.google.api.client.util.store.FileDataStoreFactory;
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
import java.nio.file.Files;
import java.util.Base64;
import java.util.Properties;

@Service
public class EmailService {

    private static final GsonFactory JSON_FACTORY =
            GsonFactory.getDefaultInstance();

    private static final String APPLICATION_NAME =
            "PrimeBasket Gmail OTP";

    // Must match the user ID used in GmailOAuthSetup.authorize(...)
    private static final String OAUTH_USER_ID =
            "primebasket-gmail";

    @Value("${gmail.oauth.credentials-path:${user.dir}/gmail-oauth/credentials.json}")
    private String credentialsPath;

    @Value("${gmail.oauth.token-store-path:${user.dir}/gmail-oauth/oauth-tokens}")
    private String tokenStorePath;

    @Value("${gmail.sender:}")
    private String configuredSenderEmail;

    public void sendRegistrationOtp(String toEmail, String otp) {
        try {
            Gmail gmail = getGmailService();
            String senderEmail = getSenderEmail();

            if (senderEmail.isBlank()) {
                throw new IllegalStateException(
                        "Gmail sender email is not configured. Set gmail.sender."
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
                    + "If you did not create an PrimeBasket account, "
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
                    "PrimeBasket OTP email sent successfully to: " + toEmail
            );

        } catch (Exception exception) {
            System.err.println(
                    "Failed to send PrimeBasket OTP email: "
                            + exception.getMessage()
            );

            throw new IllegalStateException(
                    "Unable to send OTP email. Please check the backend logs.",
                    exception
            );
        }
    }

    private Gmail getGmailService() throws Exception {
        File credentialsFile = new File(credentialsPath);
        File tokenStoreDirectory = new File(tokenStorePath);

        if (!credentialsFile.isFile()) {
            throw new IllegalStateException(
                    "Google OAuth credentials file not found: "
                            + credentialsFile.getAbsolutePath()
            );
        }

        if (!tokenStoreDirectory.isDirectory()) {
            throw new IllegalStateException(
                    "Google OAuth token store directory not found: "
                            + tokenStoreDirectory.getAbsolutePath()
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

        // Read the same credential store used by GmailOAuthSetup.
        FileDataStoreFactory storeFactory =
                new FileDataStoreFactory(tokenStoreDirectory);

        DataStore<StoredCredential> credentialStore =
                storeFactory.getDataStore(
                        StoredCredential.DEFAULT_DATA_STORE_ID
                );

        StoredCredential storedCredential =
                credentialStore.get(OAUTH_USER_ID);

        if (storedCredential == null
                || storedCredential.getRefreshToken() == null
                || storedCredential.getRefreshToken().isBlank()) {
            throw new IllegalStateException(
                    "OAuth refresh token is missing from the credential store. "
                    + "Run GmailOAuthSetup again and authorize the correct account."
            );
        }

        UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(storedCredential.getRefreshToken())
                .build();

        // Refreshes the access token using the saved refresh token.
        credentials.refreshIfExpired();

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
