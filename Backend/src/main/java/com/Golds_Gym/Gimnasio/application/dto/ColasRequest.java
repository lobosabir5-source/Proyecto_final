package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ColasRequest {
    @NotNull @Positive private Double tasaLlegadas;
    @NotNull @Positive private Double tasaServicio;
    @NotNull @Min(1) @Max(100) private Integer servidores;
    @NotNull @Min(0) @Max(100000) private Integer clientes;
    // Opcional: null = capacidad ilimitada (modelo anterior).
    @Min(1) @Max(10000) private Integer capacidadSistema;
}
