package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.PermisoAusenciaRespuesta;
import com.Golds_Gym.Gimnasio.application.service.PermisoAusenciaService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cliente/permisos")
public class PermisoAusenciaClienteController {
    private final PermisoAusenciaService permisos;

    public PermisoAusenciaClienteController(PermisoAusenciaService permisos) {
        this.permisos = permisos;
    }

    @GetMapping
    public List<PermisoAusenciaRespuesta> listar(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return permisos.listarDeUsuario(usuario.getId());
    }
}
