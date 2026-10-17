package com.Golds_Gym.Gimnasio.application.dto;
import java.math.BigDecimal;
import java.util.List;
public record ReporteResumenRespuesta(
        long clientesActivos, long membresiasActivas, long membresiasPendientes,
        long membresiasPorVencer, long membresiasVencidas, long asistenciasDeHoy,
        BigDecimal ingresosDelMes,
        List<PuntoMensualRespuesta> clientesPorMes,
        List<PuntoMensualRespuesta> ingresosPorMes,
        List<PuntoMensualRespuesta> renovacionesPorMes) {}