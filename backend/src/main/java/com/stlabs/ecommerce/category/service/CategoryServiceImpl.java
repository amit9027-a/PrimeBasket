package com.stlabs.ecommerce.category.service;

import com.stlabs.ecommerce.category.dto.CategoryRequest;
import com.stlabs.ecommerce.category.dto.CategoryResponse;
import com.stlabs.ecommerce.category.entity.Category;
import com.stlabs.ecommerce.category.repository.CategoryRepository;
import com.stlabs.ecommerce.exception.ResourceNotFoundException;
import com.stlabs.ecommerce.product.repository.ProductRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public CategoryResponse create(CategoryRequest request) {
        validateUniqueName(request.name(), null);

        Category category = new Category();
        category.setName(request.name().trim());
        category.setDescription(request.description());
        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return mapToResponse(findCategory(id));
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findCategory(id);
        validateUniqueName(request.name(), id);

        category.setName(request.name().trim());
        category.setDescription(request.description());
        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(Long id) {
        if (productRepository.existsByCategoryId(id)) {
            throw new IllegalArgumentException("Cannot delete category while products are assigned to it");
        }
        categoryRepository.delete(findCategory(id));
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void validateUniqueName(String name, Long currentCategoryId) {
        String normalizedName = name.trim();
        boolean exists = categoryRepository.findAll()
                .stream()
                .anyMatch(category -> category.getName().equalsIgnoreCase(normalizedName)
                        && (currentCategoryId == null || !category.getId().equals(currentCategoryId)));

        if (exists) {
            throw new IllegalArgumentException("Category name already exists");
        }
    }

    private CategoryResponse mapToResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription()
        );
    }
}
