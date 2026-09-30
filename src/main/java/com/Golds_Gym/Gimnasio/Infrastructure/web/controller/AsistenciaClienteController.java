package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.AsistenciaRespuesta;
import com.Golds_Gym.Gimnasio.application.service.AsistenciaService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cliente/asistencias")
public class AsistenciaClienteController {

    private final AsistenciaService asistenciaService;

    public AsistenciaClienteController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @GetMapping
    public Page<AsistenciaRespuesta> listar(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return asistenciaService.listarDeUsuario(usuario.getId(), pageable);
    }
}