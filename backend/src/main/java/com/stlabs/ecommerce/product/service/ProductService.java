package com.stlabs.ecommerce.product.service;

import com.stlabs.ecommerce.product.dto.ProductRequest;
import com.stlabs.ecommerce.product.dto.ProductImageResponse;
import com.stlabs.ecommerce.product.dto.ProductResponse;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    ProductResponse create(ProductRequest request);

    ProductResponse getById(Long id);

    List<ProductResponse> getAll();

    ProductResponse update(Long id,
                           ProductRequest request);

    void delete(Long id);

    ProductImageResponse uploadImage(Long productId, MultipartFile file, boolean primaryImage);

    void deleteImage(Long productId, Long imageId);
}
