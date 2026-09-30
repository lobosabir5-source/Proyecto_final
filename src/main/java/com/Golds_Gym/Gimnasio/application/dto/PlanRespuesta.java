package com.Golds_Gym.Gimnasio.application.dto;

import java.math.BigDecimal;

public record PlanRespuesta(Long id, String nombre, String descripcion, int duracionDias, BigDecimal precio, boolean activo) {
}