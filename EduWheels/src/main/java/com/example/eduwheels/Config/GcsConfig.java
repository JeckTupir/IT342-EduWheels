package com.example.eduwheels.Config;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class GcsConfig {

    @Bean
    public Storage storage() throws IOException {
        // Google Cloud Storage client will automatically pick up credentials
        // from the GOOGLE_APPLICATION_CREDENTIALS environment variable
        return StorageOptions.getDefaultInstance().getService();
    }
}
