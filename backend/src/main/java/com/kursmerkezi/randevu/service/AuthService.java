package com.kursmerkezi.randevu.service;

import com.kursmerkezi.randevu.dto.LoginRequest;
import com.kursmerkezi.randevu.dto.LoginResponse;
import com.kursmerkezi.randevu.exception.ApiException;
import com.kursmerkezi.randevu.security.JwtService;
import com.kursmerkezi.randevu.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            String token = jwtService.generateToken(principal);
            return new LoginResponse(token, principal.getId(), principal.getUsername(),
                    principal.getUser().getFullName(), principal.getRole());
        } catch (BadCredentialsException ex) {
            throw new ApiException("Kullanıcı adı veya şifre hatalı", HttpStatus.UNAUTHORIZED);
        }
    }
}
