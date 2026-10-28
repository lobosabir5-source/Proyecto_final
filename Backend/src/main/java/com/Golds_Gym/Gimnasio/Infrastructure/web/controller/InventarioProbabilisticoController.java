
package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.InventarioProbabilisticoRequest;
import com.Golds_Gym.Gimnasio.application.dto.InventarioProbabilisticoRespuesta;
import com.Golds_Gym.Gimnasio.application.service.InventarioProbabilisticoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/inventario/modelos")
@RequiredArgsConstructor
public class InventarioProbabilisticoController {

    private final InventarioProbabilisticoService service;

    @PostMapping("/probabilistico")
    public ResponseEntity<InventarioProbabilisticoRespuesta> calcular(
            @Valid @RequestBody InventarioProbabilisticoRequest request) {

        return ResponseEntity.ok(service.calcular(request));
    }
}
