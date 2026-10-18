package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.ConfiguracionPublicaRespuesta;
import com.Golds_Gym.Gimnasio.application.service.ConfiguracionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/configuracion")
public class ConfiguracionPublicController {

 private final ConfiguracionService servicio;

 public ConfiguracionPublicController(
         ConfiguracionService servicio) {
  this.servicio = servicio;
 }

 @GetMapping
 public ConfiguracionPublicaRespuesta obtener() {
  return servicio.publico();
 }
}