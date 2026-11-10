package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.*;
import java.time.*;

public record GuardarClaseAerobicaRequest(@NotBlank String nombre, String descripcion, @NotNull Long instructorId,
        @NotNull LocalDate fecha, @NotNull LocalTime horaInicio, @NotNull LocalTime horaFin,
        @NotNull @Min(1) Integer cupoMaximo) {
}
