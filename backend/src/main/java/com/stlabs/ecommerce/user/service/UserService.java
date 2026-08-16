package com.stlabs.ecommerce.user.service;

import com.stlabs.ecommerce.user.dto.UserResponse;
import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getCurrentUser();
}
