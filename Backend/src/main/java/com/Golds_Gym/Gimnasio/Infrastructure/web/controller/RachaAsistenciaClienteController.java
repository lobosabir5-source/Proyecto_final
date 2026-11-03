package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.RachaAsistenciaRespuesta;
import com.Golds_Gym.Gimnasio.application.service.RachaAsistenciaService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cliente/racha")
public class RachaAsistenciaClienteController {
    private final RachaAsistenciaService servicio;
    public RachaAsistenciaClienteController(RachaAsistenciaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public RachaAsistenciaRespuesta obtener(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return servicio.obtener(usuario.getId());
    }
}
