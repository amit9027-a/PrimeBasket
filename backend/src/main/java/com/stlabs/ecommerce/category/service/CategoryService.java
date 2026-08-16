package com.stlabs.ecommerce.category.service;

import com.stlabs.ecommerce.category.dto.CategoryRequest;
import com.stlabs.ecommerce.category.dto.CategoryResponse;
import java.util.List;

public interface CategoryService {

    CategoryResponse create(CategoryRequest request);

    List<CategoryResponse> getAll();

    CategoryResponse getById(Long id);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);
}
