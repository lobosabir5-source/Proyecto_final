package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.CrearUsuarioRequest;
import com.Golds_Gym.Gimnasio.application.service.AuthService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final AuthService authService;

    public UsuarioController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<UsuarioRespuesta> crear(@RequestBody CrearUsuarioRequest request) {
        Usuario usuario = authService.crearUsuario(request.usuario(), request.password(), request.rol());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UsuarioRespuesta(usuario.getId(), usuario.getUsuario(), usuario.getRol()));
    }

    public record UsuarioRespuesta(Long id, String usuario, com.Golds_Gym.Gimnasio.domain.model.Rol rol) {
    }
}
