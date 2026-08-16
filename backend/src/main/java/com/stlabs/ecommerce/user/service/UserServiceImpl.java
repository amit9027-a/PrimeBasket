package com.stlabs.ecommerce.user.service;

import com.stlabs.ecommerce.common.security.CurrentUserService;
import com.stlabs.ecommerce.user.dto.UserResponse;
import com.stlabs.ecommerce.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    public UserResponse getCurrentUser() {
        return UserResponse.from(currentUserService.getCurrentUser());
    }
}
