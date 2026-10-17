package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.PromocionRespuesta;
import com.Golds_Gym.Gimnasio.application.service.PromocionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cliente/promociones")
@PreAuthorize("hasRole('CLIENTE')")
public class PromocionClienteController {
    private final PromocionService promociones;

    public PromocionClienteController(PromocionService promociones) {
        this.promociones = promociones;
    }

    @GetMapping
    public List<PromocionRespuesta> listarVigentes() {
        return promociones.listarVigentes();
    }
}
