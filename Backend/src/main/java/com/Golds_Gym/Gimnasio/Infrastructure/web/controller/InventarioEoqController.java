package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.CalcularEoqRequest;
import com.Golds_Gym.Gimnasio.application.dto.CalcularEoqRespuesta;
import com.Golds_Gym.Gimnasio.application.service.InventarioEoqService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/inventario/modelos")
public class InventarioEoqController {
    private final InventarioEoqService servicio;

    public InventarioEoqController(InventarioEoqService servicio) {
        this.servicio = servicio;
    }

    @PostMapping("/eoq")
    public CalcularEoqRespuesta calcular(@Valid @RequestBody CalcularEoqRequest solicitud) {
        return servicio.calcular(solicitud);
    }
}
