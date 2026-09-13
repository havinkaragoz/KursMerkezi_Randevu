package com.kursmerkezi.randevu.config;

import com.kursmerkezi.randevu.model.Role;
import com.kursmerkezi.randevu.model.User;
import com.kursmerkezi.randevu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Sistem Yöneticisi")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }
}
