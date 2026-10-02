package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
		@NotBlank(message = "El usuario es obligatorio")
		@Size(max = 80, message = "El usuario no puede superar 80 caracteres")
		String usuario,
		@NotBlank(message = "La contraseña es obligatoria")
		@Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
		String password) {
	public RegistroRequest {
		usuario = usuario == null ? null : usuario.trim();
	}
}
