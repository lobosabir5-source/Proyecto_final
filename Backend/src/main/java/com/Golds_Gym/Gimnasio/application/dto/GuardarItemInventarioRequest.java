package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record GuardarItemInventarioRequest(@NotBlank @Size(max = 120) String nombre,
        @NotBlank String categoria, @NotBlank String unidad, @NotNull @DecimalMin("0.000") BigDecimal minimo,
        @Size(max = 255) String descripcion) {
}