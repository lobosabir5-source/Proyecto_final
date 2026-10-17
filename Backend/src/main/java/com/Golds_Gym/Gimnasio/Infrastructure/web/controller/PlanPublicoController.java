package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.PlanRespuesta;
import com.Golds_Gym.Gimnasio.application.service.PlanService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/public/planes")
public class PlanPublicoController {

    private final PlanService planService;

    public PlanPublicoController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public List<PlanRespuesta> listarActivos() {
        return planService.listarActivos();
    }
}