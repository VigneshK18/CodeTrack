package com.codetrack.service;

import com.codetrack.exception.ResourceNotFoundException;
import com.codetrack.model.AppUser;
import com.codetrack.repository.AppUserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final AppUserRepository userRepository;

    public UserService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AppUser getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
