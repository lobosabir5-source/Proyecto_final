package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.EstadoMembresia;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MembresiaRespuesta(
        Long id,
        Long clienteId,
        String cliente,
        Long planId,
        String plan,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        EstadoMembresia estado,
        BigDecimal precioTotal,
        BigDecimal pagado,
        BigDecimal saldo) {
}