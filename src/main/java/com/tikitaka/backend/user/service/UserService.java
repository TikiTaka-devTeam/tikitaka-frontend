package com.tikitaka.backend.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tikitaka.backend.global.config.security.CurrentUserProvider;
import com.tikitaka.backend.user.dto.UserProfileResponse;
import com.tikitaka.backend.user.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final CurrentUserProvider currentUserProvider;

    public UserProfileResponse getMyProfile() {
        User currentUser = currentUserProvider.getCurrentUser();
        return UserProfileResponse.from(currentUser);
    }
}
