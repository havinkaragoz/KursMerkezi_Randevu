package com.kursmerkezi.randevu.service;

import com.kursmerkezi.randevu.dto.CreateUserRequest;
import com.kursmerkezi.randevu.dto.UserResponse;
import com.kursmerkezi.randevu.exception.ApiException;
import com.kursmerkezi.randevu.model.User;
import com.kursmerkezi.randevu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;

    public UserResponse createUser(Long adminId, CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException("Bu kullanıcı adı zaten kullanılıyor", HttpStatus.CONFLICT);
        }

        User admin = getUser(adminId);

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .build();

        user = userRepository.save(user);

        activityLogService.log(admin, "USER_CREATE",
                admin.getFullName() + ", \"" + user.getFullName() + "\" (" + user.getRole() + ") kullanıcısını oluşturdu");

        return UserResponse.from(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public void deleteUser(Long adminId, Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));

        User admin = getUser(adminId);

        userRepository.deleteById(id);

        activityLogService.log(admin, "USER_DELETE",
                admin.getFullName() + ", \"" + target.getFullName() + "\" kullanıcısını sildi");
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));
    }
}
