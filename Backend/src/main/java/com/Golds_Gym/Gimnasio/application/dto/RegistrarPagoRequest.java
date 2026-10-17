package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.MetodoPago;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record RegistrarPagoRequest(
        @NotNull(message = "La membresía es obligatoria") @Positive(message = "La membresía no es válida") Long membresiaId,
        @NotNull(message = "El monto es obligatorio")
        @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
        @Digits(integer = 8, fraction = 2, message = "El monto admite hasta 8 enteros y 2 decimales")
        BigDecimal monto,
        @NotNull(message = "El método de pago es obligatorio") MetodoPago metodo) {
}