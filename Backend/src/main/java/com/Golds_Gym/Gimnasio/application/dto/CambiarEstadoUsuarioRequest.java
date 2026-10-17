package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoUsuarioRequest(@NotNull(message = "El estado es obligatorio") Boolean activo) {
}