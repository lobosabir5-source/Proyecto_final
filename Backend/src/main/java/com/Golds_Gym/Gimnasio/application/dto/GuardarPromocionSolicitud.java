package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.Promocion.TipoDescuento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GuardarPromocionSolicitud(
                @NotBlank(message = "El nombre es obligatorio") @Size(max = 100, message = "El nombre no puede superar 100 caracteres") String nombre,
                @NotNull(message = "El tipo de descuento es obligatorio") TipoDescuento tipo,
                @NotNull(message = "El valor es obligatorio") @DecimalMin(value = "0.01", message = "El valor debe ser mayor a cero") @Digits(integer = 8, fraction = 2, message = "El valor admite hasta 8 enteros y 2 decimales") BigDecimal valor,
                @NotNull(message = "La fecha de inicio es obligatoria") LocalDate fechaInicio,
                @NotNull(message = "La fecha de fin es obligatoria") LocalDate fechaFin,
                @Positive(message = "El plan no es válido") Long planId,
                boolean activo) {
}
