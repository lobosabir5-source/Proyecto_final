package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.PagoRespuesta;
import com.Golds_Gym.Gimnasio.application.service.PagoService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cliente/pagos")
public class PagoClienteController {

    private final PagoService pagoService;

    public PagoClienteController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @GetMapping
    public Page<PagoRespuesta> listar(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return pagoService.listarDeUsuario(usuario.getId(), pageable);
    }
}