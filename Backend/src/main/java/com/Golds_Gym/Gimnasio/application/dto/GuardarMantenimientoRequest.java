package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class GuardarMantenimientoRequest {
    @NotNull
    private Long equipoId;
    @NotNull
    private LocalDate fechaProgramada;
    private Long tecnicoId;
    @Size(max = 1000)
    private String observaciones;
}
