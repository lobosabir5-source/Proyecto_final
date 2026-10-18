package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.PromocionRespuesta;
import com.Golds_Gym.Gimnasio.application.service.PromocionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/promociones")
public class PromocionPublicController {
    private final PromocionService servicio;

    public PromocionPublicController(PromocionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<PromocionRespuesta> vigentes() {
        return servicio.listarVigentes();
    }
}
