package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.Rol;

public record CrearUsuarioRequest(String usuario, String password, Rol rol) {
}
