package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.service.RenovacionMembresiaService;
import com.Golds_Gym.Gimnasio.application.dto.HistorialMembresiaRespuesta;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/recepcion/membresias")
@PreAuthorize("hasAnyRole('ADMIN','RECEPCION')")
public class RenovacionMembresiaController {
    private final RenovacionMembresiaService servicio;

    public RenovacionMembresiaController(RenovacionMembresiaService servicio) {
        this.servicio = servicio;
    }

    @PostMapping("/{id}/renovar")
    public HistorialMembresiaRespuesta renovar(@PathVariable Long id) {
        return servicio.renovar(id);
    }

    @GetMapping("/historial/cliente/{clienteId}")
    public List<HistorialMembresiaRespuesta> historial(@PathVariable Long clienteId) {
        return servicio.historial(clienteId);
    }
}
