package com.Golds_Gym.Gimnasio.application.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PermisoAusenciaRespuesta(

        Integer id,
        Long membresiaId,
        String motivo,
        Integer diasAgregados,
        LocalDateTime solicitadoEn,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String estado,
        LocalDateTime resueltoEn

) {
}