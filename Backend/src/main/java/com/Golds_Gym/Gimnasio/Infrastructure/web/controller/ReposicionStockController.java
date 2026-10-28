package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.ReponerStockRequest;
import com.Golds_Gym.Gimnasio.application.dto.ReposicionStockRespuesta;
import com.Golds_Gym.Gimnasio.application.service.ReposicionStockService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/productos-bar")
public class ReposicionStockController {
    private final ReposicionStockService servicio;

    public ReposicionStockController(ReposicionStockService servicio) {
        this.servicio = servicio;
    }

    @PostMapping("/{id}/reposiciones")
    public ReposicionStockRespuesta reponer(@PathVariable Integer id,
                                           @Valid @RequestBody ReponerStockRequest solicitud) {
        return servicio.reponer(id, solicitud);
    }
}
