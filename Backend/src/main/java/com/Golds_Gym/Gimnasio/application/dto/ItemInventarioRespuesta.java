package com.Golds_Gym.Gimnasio.application.dto;

import java.math.BigDecimal;

public record ItemInventarioRespuesta(Long id, String nombre, String categoria, String unidad, BigDecimal existencia,
        BigDecimal minimo, boolean alertaMinimo, String descripcion, boolean activo) {
}