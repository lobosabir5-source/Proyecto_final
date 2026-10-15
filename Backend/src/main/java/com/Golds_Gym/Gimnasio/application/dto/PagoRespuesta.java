package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PagoRespuesta(
        Long id,
        Long membresiaId,
        String cliente,
        BigDecimal monto,
        MetodoPago metodo,
        LocalDateTime fechaPago,
        String registradoPor) {
}