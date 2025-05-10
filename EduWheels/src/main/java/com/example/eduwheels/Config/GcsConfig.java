package com.example.eduwheels.Config;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class GcsConfig {

    @Bean
    public Storage storage() throws IOException {
        String gcpCredentialsJson = System.getenv("GCP_SA_KEY_JSON_CONTENT");
        if (gcpCredentialsJson == null || gcpCredentialsJson.isEmpty()) {
            System.err.println("GCP_SA_KEY_JSON_CONTENT environment variable not set. Cannot authenticate.");
            throw new IOException("GCP credentials environment variable not found.");
        }

        GoogleCredentials credentials = GoogleCredentials.fromStream(
                new ByteArrayInputStream(gcpCredentialsJson.getBytes(StandardCharsets.UTF_8))
        );
        return StorageOptions.newBuilder()
                .setCredentials(credentials)
                .setProjectId("capable-conduit-451201-17") // Replace with your actual project ID if needed
                .build()
                .getService();
    }
}