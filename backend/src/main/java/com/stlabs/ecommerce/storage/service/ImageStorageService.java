package com.stlabs.ecommerce.storage.service;

import com.stlabs.ecommerce.storage.dto.StoredImage;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    StoredImage uploadProductImage(MultipartFile file) throws IOException;

    void deleteImage(String publicId) throws IOException;
}
