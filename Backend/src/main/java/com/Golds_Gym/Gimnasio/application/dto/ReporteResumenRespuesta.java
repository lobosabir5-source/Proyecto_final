package com.Golds_Gym.Gimnasio.application.dto;

import java.math.BigDecimal;

public record ReporteResumenRespuesta(
        long clientesActivos,
        long membresiasActivas,
        long membresiasPendientes,
        long asistenciasDeHoy,
        BigDecimal ingresosDelMes) {
}