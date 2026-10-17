package com.Golds_Gym.Gimnasio.application.dto;

import com.Golds_Gym.Gimnasio.domain.model.Rol;

public record AuthResponse(String token, String usuario, Rol rol) {
}
