package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.Golds_Gym.Gimnasio.domain.model.Promocion.TipoDescuento;

public record GuardarPromocionSolicitud(@NotBlank String nombre, @NotNull TipoDescuento tipo,
        @NotNull @DecimalMin("0.01") BigDecimal valor, @NotNull LocalDate fechaInicio,
        @NotNull LocalDate fechaFin, Long planId, boolean activo) {
}
