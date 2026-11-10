package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record RegistrarMovimientoInventarioRequest(@NotBlank String tipo,
        @NotNull @DecimalMin(value = "0.000", inclusive = false) BigDecimal cantidad, @Size(max = 255) String motivo) {
}