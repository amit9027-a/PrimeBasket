package com.stlabs.ecommerce.product.controller;

import com.stlabs.ecommerce.product.dto.ProductRequest;
import com.stlabs.ecommerce.product.dto.ProductImageResponse;
import com.stlabs.ecommerce.product.dto.ProductResponse;
import com.stlabs.ecommerce.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog and image management")
public class ProductController {
    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a product", description = "Admin only")
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by id")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping
    @Operation(summary = "List all products")
    public List<ProductResponse> getAll() {
        return productService.getAll();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product", description = "Admin only")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a product", description = "Admin only")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    @PostMapping("/{productId}/images")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload a product image", description = "Admin only. Requires Cloudinary credentials.")
    public ProductImageResponse uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(name = "primary", defaultValue = "false") boolean primary
    ) {
        return productService.uploadImage(productId, file, primary);
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a product image", description = "Admin only")
    public void deleteImage(@PathVariable Long productId, @PathVariable Long imageId) {
        productService.deleteImage(productId, imageId);
    }
}
