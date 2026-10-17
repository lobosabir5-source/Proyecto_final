package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.MembresiaRespuesta;
import com.Golds_Gym.Gimnasio.application.service.MembresiaService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cliente/membresias")
public class MembresiaClienteController {

    private final MembresiaService membresiaService;

    public MembresiaClienteController(MembresiaService membresiaService) {
        this.membresiaService = membresiaService;
    }

    @GetMapping
    public Page<MembresiaRespuesta> listar(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return membresiaService.listarDeUsuario(usuario.getId(), pageable);
    }
}