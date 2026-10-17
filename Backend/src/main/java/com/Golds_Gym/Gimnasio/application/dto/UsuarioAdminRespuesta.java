package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.Rol;

public record UsuarioAdminRespuesta(Long id, String usuario, Rol rol, boolean activo) {
}