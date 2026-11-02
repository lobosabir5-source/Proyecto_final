package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SolicitarPermisoRequest(

        @NotNull
        Long membresiaId,

        @NotNull
        LocalDate fechaInicio,

        @NotNull
        LocalDate fechaFin,

        @NotBlank
        @Size(max = 255)
        String motivo

) {
}