package com.Golds_Gym.Gimnasio.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimientoInventarioRespuesta(Long id, Long itemId, String tipo, BigDecimal cantidad,
        BigDecimal saldoAnterior, BigDecimal saldoPosterior, String responsable, String motivo, LocalDateTime fecha) {
}