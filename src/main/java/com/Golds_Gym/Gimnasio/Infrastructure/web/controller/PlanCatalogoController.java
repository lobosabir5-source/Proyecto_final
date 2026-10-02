package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.PlanRespuesta;
import com.Golds_Gym.Gimnasio.application.service.PlanService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PlanCatalogoController {

    private final PlanService planService;

    public PlanCatalogoController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping({"/api/recepcion/planes", "/api/cliente/planes"})
    public List<PlanRespuesta> listarActivos() {
        return planService.listarActivos();
    }
}