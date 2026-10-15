package com.Golds_Gym.Gimnasio.application.dto;

import java.math.BigDecimal;

public record RegistroRespuesta(
        String usuario,
        Long membresiaId,
        String plan,
        BigDecimal montoAPagar,
        String mensaje) {
}