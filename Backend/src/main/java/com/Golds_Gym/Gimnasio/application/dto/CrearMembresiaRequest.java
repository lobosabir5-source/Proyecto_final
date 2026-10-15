package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CrearMembresiaRequest(
        @NotNull(message = "El cliente es obligatorio") @Positive(message = "El cliente no es válido") Long clienteId,
        @NotNull(message = "El plan es obligatorio") @Positive(message = "El plan no es válido") Long planId) {
}