package com.stlabs.ecommerce.storage.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.stlabs.ecommerce.storage.dto.StoredImage;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CloudinaryImageStorageService implements ImageStorageService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Value("${cloudinary.folder}")
    private String folder;

    @Override
    public StoredImage uploadProductImage(MultipartFile file) throws IOException {
        ensureConfigured();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder", folder)
        );

        return new StoredImage(
                result.get("public_id").toString(),
                result.get("secure_url").toString()
        );
    }

    @Override
    public void deleteImage(String publicId) throws IOException {
        if (!isConfigured() || !StringUtils.hasText(publicId)) {
            return;
        }

        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    private void ensureConfigured() {
        if (!isConfigured()) {
            throw new IllegalStateException("Cloudinary is not configured. Please set cloudinary credentials.");
        }
    }

    private boolean isConfigured() {
        return StringUtils.hasText(cloudName)
                && StringUtils.hasText(apiKey)
                && StringUtils.hasText(apiSecret);
    }
}
