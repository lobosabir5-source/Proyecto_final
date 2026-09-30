package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.GuardarPlanRequest;
import com.Golds_Gym.Gimnasio.application.dto.PlanRespuesta;
import com.Golds_Gym.Gimnasio.application.service.PlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/planes")
public class PlanAdminController {

    private final PlanService planService;

    public PlanAdminController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public List<PlanRespuesta> listar() {
        return planService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<PlanRespuesta> crear(@Valid @RequestBody GuardarPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.crear(request));
    }

    @PutMapping("/{id}")
    public PlanRespuesta actualizar(@PathVariable Long id, @Valid @RequestBody GuardarPlanRequest request) {
        return planService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        planService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}