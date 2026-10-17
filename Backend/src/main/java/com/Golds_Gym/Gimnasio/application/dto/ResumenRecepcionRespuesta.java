package com.Golds_Gym.Gimnasio.application.dto;
import java.math.BigDecimal;
import java.util.List;
    public record ResumenRecepcionRespuesta(
        long clientesActivos, long asistenciasDeHoy, long membresiasPorVencer,
        BigDecimal ingresosDelMes,
        List<MembresiaRespuesta> proximasAVencer,
        List<ClienteRespuesta> clientesRecientes,
        List<PagoRespuesta> pagosRecientes) {}