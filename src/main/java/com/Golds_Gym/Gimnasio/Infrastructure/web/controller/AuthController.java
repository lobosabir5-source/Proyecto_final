package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.AuthResponse;
import com.Golds_Gym.Gimnasio.application.dto.LoginRequest;
import com.Golds_Gym.Gimnasio.application.dto.RegistroRequest;
import com.Golds_Gym.Gimnasio.application.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrarCliente(request));
    }

    @PostMapping("/login")
    public AuthResponse iniciarSesion(@Valid @RequestBody LoginRequest request) {
        return authService.iniciarSesion(request);
    }
}
