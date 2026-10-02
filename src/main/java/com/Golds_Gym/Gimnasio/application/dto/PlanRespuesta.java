package com.Golds_Gym.Gimnasio.application.dto;

import java.math.BigDecimal;
import java.util.List;

public record PlanRespuesta(
        Long id,
        String nombre,
        String descripcion,
        int duracionDias,
        BigDecimal precio,
        boolean activo,
        String horario,
        List<String> beneficios,
        String imagenUrl,
        boolean destacado,
        int orden) {
}