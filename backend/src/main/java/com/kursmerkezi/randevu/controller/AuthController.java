package com.kursmerkezi.randevu.controller;

import com.kursmerkezi.randevu.dto.LoginRequest;
import com.kursmerkezi.randevu.dto.LoginResponse;
import com.kursmerkezi.randevu.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
