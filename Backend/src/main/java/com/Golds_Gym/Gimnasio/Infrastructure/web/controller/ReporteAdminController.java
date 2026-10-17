package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.ReporteResumenRespuesta;
import com.Golds_Gym.Gimnasio.application.service.ReporteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reportes")
public class ReporteAdminController {

    private final ReporteService reporteService;

    public ReporteAdminController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/resumen")
    public ReporteResumenRespuesta resumen() {
        return reporteService.resumen();
    }
}