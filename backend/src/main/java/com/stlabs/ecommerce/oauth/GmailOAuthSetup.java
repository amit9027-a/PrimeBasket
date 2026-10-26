
package com.stlabs.ecommerce.oauth;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;

import java.io.File;
import java.io.FileReader;
import java.util.List;

public class GmailOAuthSetup {

    private static final String CREDENTIALS_FILE =
            "gmail-oauth/credentials.json";

    private static final String TOKENS_DIRECTORY =
            "gmail-oauth/oauth-tokens";

    public static void main(String[] args) throws Exception {

        var httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        var jsonFactory = GsonFactory.getDefaultInstance();

        GoogleClientSecrets clientSecrets =
                GoogleClientSecrets.load(
                        jsonFactory,
                        new FileReader(CREDENTIALS_FILE)
                );

        GoogleAuthorizationCodeFlow flow =
                new GoogleAuthorizationCodeFlow.Builder(
                        httpTransport,
                        jsonFactory,
                        clientSecrets,
                        List.of("https://www.googleapis.com/auth/gmail.send")
                )
                .setDataStoreFactory(
                        new FileDataStoreFactory(new File(TOKENS_DIRECTORY))
                )
                .setAccessType("offline")
                .setApprovalPrompt("force")
                .build();

        LocalServerReceiver receiver =
                new LocalServerReceiver.Builder()
                        .setPort(8888)
                        .build();

        Credential credential =
                new AuthorizationCodeInstalledApp(flow, receiver)
                        .authorize("primebasket-gmail");

        String refreshToken = credential.getRefreshToken();

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalStateException(
                    "Refresh token nahi mila. Google account access revoke karke dobara consent do."
            );
        }

        System.out.println("Google OAuth authorization successful.");
        System.out.println("Refresh token saved in: " + TOKENS_DIRECTORY);
        System.out.println("Ab refresh token ko application token.json format mein configure karna hoga.");
    }
}
