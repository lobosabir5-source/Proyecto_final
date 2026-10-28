
package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventarioProbabilisticoRequest {

    @NotNull
    @Positive
    private Double demandaDiaria;

    @NotNull
    @PositiveOrZero
    private Double desviacionDiaria;

    @NotNull
    @Positive
    private Double tiempoEntregaDias;

    @NotNull
    @DecimalMin("0.000001")
    @DecimalMax("0.999999")
    private Double nivelServicio;

    @NotNull
    @PositiveOrZero
    private Integer stockActual;
}
