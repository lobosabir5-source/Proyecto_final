package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;
import com.Golds_Gym.Gimnasio.application.dto.ResumenRecepcionRespuesta;
import com.Golds_Gym.Gimnasio.application.service.ReporteService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recepcion/reportes")
public class ReporteRecepcionController {
    private final ReporteService reporteService;
    public ReporteRecepcionController(ReporteService reporteService) { this.reporteService = reporteService; }
    @GetMapping("/resumen")
    public ResumenRecepcionRespuesta resumen() { return reporteService.resumenRecepcion(); }
}