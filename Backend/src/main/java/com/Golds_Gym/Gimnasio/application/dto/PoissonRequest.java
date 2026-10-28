package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PoissonRequest {
    @NotNull @Positive
    private Double tasaLlegadas;
    @NotNull @Positive
    private Double tiempoHoras;
    @NotNull @Min(0) @Max(10000)
    private Integer eventos;
}
