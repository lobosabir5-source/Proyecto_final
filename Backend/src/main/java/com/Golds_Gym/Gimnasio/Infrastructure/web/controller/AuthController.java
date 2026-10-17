package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.AuthResponse;
import com.Golds_Gym.Gimnasio.application.dto.LoginRequest;
import com.Golds_Gym.Gimnasio.application.dto.RegistroRequest;
import com.Golds_Gym.Gimnasio.application.dto.RegistroRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.VerificarRegistroRequest;
import com.Golds_Gym.Gimnasio.application.service.AuthService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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
    public ResponseEntity<MensajeRespuesta> solicitarCodigo(@Valid @RequestBody RegistroRequest request) {
        authService.solicitarCodigoRegistro(request);
        return ResponseEntity.ok(new MensajeRespuesta("Te enviamos un código de verificación a tu correo."));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<RegistroRespuesta> verificarCodigo(@Valid @RequestBody VerificarRegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.verificarCodigoRegistro(request.registro(), request.codigo()));
    }

    @PostMapping("/login")
    public AuthResponse iniciarSesion(@Valid @RequestBody LoginRequest request) {
        return authService.iniciarSesion(request);
    }

    @GetMapping("/me")
    public PerfilRespuesta perfil(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return new PerfilRespuesta(usuario.getId(), usuario.getUsuario(), authService.nombreVisible(usuario), usuario.getRol());
    }

    public record PerfilRespuesta(Long id, String usuario, String nombre, com.Golds_Gym.Gimnasio.domain.model.Rol rol) {
    }

    public record MensajeRespuesta(String mensaje) {
    }
}
