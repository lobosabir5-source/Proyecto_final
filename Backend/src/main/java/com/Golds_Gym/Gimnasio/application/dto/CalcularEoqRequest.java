package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record CalcularEoqRequest(
        @NotNull @DecimalMin(value = "0.0", inclusive = false) Double demandaAnual,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) Double costoPorPedido,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) Double costoMantenimientoAnual
) {}
