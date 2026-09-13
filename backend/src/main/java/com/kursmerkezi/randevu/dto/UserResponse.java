package com.kursmerkezi.randevu.dto;

import com.kursmerkezi.randevu.model.User;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String role;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(), user.getUsername(), user.getFullName(), user.getRole().name(), user.getCreatedAt());
    }
}
