package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record EditarMembresiaRequest(
        @NotNull(message = "La fecha de inicio es obligatoria") LocalDate fechaInicio,
        @NotNull(message = "La fecha de fin es obligatoria") LocalDate fechaFin) {
}