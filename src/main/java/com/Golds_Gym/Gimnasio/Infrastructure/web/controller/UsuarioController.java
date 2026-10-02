package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.CrearUsuarioRequest;
import com.Golds_Gym.Gimnasio.application.dto.CambiarEstadoUsuarioRequest;
import com.Golds_Gym.Gimnasio.application.dto.UsuarioAdminRespuesta;
import com.Golds_Gym.Gimnasio.application.service.AuthService;
import com.Golds_Gym.Gimnasio.application.service.UsuarioAdminService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final AuthService authService;
    private final UsuarioAdminService usuarioAdminService;

    public UsuarioController(AuthService authService, UsuarioAdminService usuarioAdminService) {
        this.authService = authService;
        this.usuarioAdminService = usuarioAdminService;
    }

    @PostMapping
    public ResponseEntity<UsuarioRespuesta> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        Usuario usuario = authService.crearUsuario(request.usuario(), request.password(), request.rol());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UsuarioRespuesta(usuario.getId(), usuario.getUsuario(), usuario.getRol()));
    }

    @GetMapping
    public Page<UsuarioAdminRespuesta> listar(@PageableDefault(size = 20) Pageable pageable) {
        return usuarioAdminService.listar(pageable);
    }

    @PatchMapping("/{id}/estado")
    public UsuarioAdminRespuesta cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoUsuarioRequest request,
            Authentication authentication) {
        Usuario administrador = (Usuario) authentication.getPrincipal();
        return usuarioAdminService.cambiarEstado(id, request.activo(), administrador.getId());
    }

    public record UsuarioRespuesta(Long id, String usuario, com.Golds_Gym.Gimnasio.domain.model.Rol rol) {
    }
}
