package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.ColasService;
import com.Golds_Gym.Gimnasio.application.service.ColasAdicionalesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/investigacion-operativa/colas")
@RequiredArgsConstructor
public class ColasController {
    private final ColasService service;
    private final ColasAdicionalesService adicionalesService;

    @PostMapping("/calcular")
    public ResponseEntity<ColasRespuesta> calcular(@Valid @RequestBody ColasRequest request) {
        return ResponseEntity.ok(service.calcular(request));
    }

    @PostMapping("/infinita")
    public ResponseEntity<ColasRespuesta> infinita(@Valid @RequestBody ColaInfinitaRequest request) {
        return ResponseEntity.ok(adicionalesService.calcularInfinita(request));
    }

    @PostMapping("/poisson")
    public ResponseEntity<PoissonRespuesta> poisson(@Valid @RequestBody PoissonRequest request) {
        return ResponseEntity.ok(adicionalesService.calcularPoisson(request));
    }
}
