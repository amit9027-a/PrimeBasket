package com.stlabs.ecommerce.product.service;

import com.stlabs.ecommerce.category.entity.Category;
import com.stlabs.ecommerce.category.repository.CategoryRepository;
import com.stlabs.ecommerce.exception.ResourceNotFoundException;
import com.stlabs.ecommerce.product.dto.ProductImageResponse;
import com.stlabs.ecommerce.product.dto.ProductRequest;
import com.stlabs.ecommerce.product.dto.ProductResponse;
import com.stlabs.ecommerce.product.entity.Product;
import com.stlabs.ecommerce.product.entity.ProductImage;
import com.stlabs.ecommerce.product.repository.ProductImageRepository;
import com.stlabs.ecommerce.product.repository.ProductRepository;
import com.stlabs.ecommerce.storage.dto.StoredImage;
import com.stlabs.ecommerce.storage.service.ImageStorageService;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ImageStorageService imageStorageService;

    @Override
    public ProductResponse create(ProductRequest request) {
        Category category = findCategory(request.categoryId());

        Product product = new Product();
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setCategory(category);

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return mapToResponse(findProduct(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findProduct(id);
        Category category = findCategory(request.categoryId());

        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setCategory(category);

        return mapToResponse(productRepository.save(product));
    }

    @Override
    public void delete(Long id) {
        Product product = findProduct(id);

        for (ProductImage image : product.getImages()) {
            try {
                imageStorageService.deleteImage(image.getPublicId());
            } catch (IOException ex) {
                throw new IllegalStateException("Failed to delete image from Cloudinary", ex);
            }
        }

        productRepository.delete(product);
    }

    @Override
    public ProductImageResponse uploadImage(Long productId, MultipartFile file, boolean primaryImage) {
        Product product = findProduct(productId);
        StoredImage storedImage;

        try {
            storedImage = imageStorageService.uploadProductImage(file);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to upload image to Cloudinary", ex);
        }

        if (primaryImage || product.getImages().isEmpty()) {
            clearPrimaryFlag(product);
        }

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(storedImage.imageUrl());
        image.setPublicId(storedImage.publicId());
        image.setPrimaryImage(primaryImage || product.getImages().isEmpty());

        ProductImage savedImage = productImageRepository.save(image);
        product.getImages().add(savedImage);
        return mapToImageResponse(savedImage);
    }

    @Override
    public void deleteImage(Long productId, Long imageId) {
        ProductImage image = productImageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product image not found"));

        try {
            imageStorageService.deleteImage(image.getPublicId());
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to delete image from Cloudinary", ex);
        }

        productImageRepository.delete(image);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void clearPrimaryFlag(Product product) {
        product.getImages().forEach(existingImage -> existingImage.setPrimaryImage(false));
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getImages()
                        .stream()
                        .map(this::mapToImageResponse)
                        .toList()
        );
    }

    private ProductImageResponse mapToImageResponse(ProductImage image) {
        return new ProductImageResponse(
                image.getId(),
                image.getImageUrl(),
                image.isPrimaryImage()
        );
    }
}
