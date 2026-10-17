package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.RutinaRespuesta;
import com.Golds_Gym.Gimnasio.application.service.RutinaService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cliente/rutinas")
public class RutinaClienteController {

    private final RutinaService rutinaService;

    public RutinaClienteController(RutinaService rutinaService) {
        this.rutinaService = rutinaService;
    }

    @GetMapping
    public Page<RutinaRespuesta> listar(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return rutinaService.listarDeUsuario(usuario.getId(), pageable);
    }
}