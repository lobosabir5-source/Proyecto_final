package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrearRutinaPropiaRequest {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
    private String nombre;

    @NotBlank(message = "El contenido es obligatorio")
    @Size(max = 10000, message = "El contenido no puede superar 10000 caracteres")
    private String contenido;

    public void setNombre(String nombre) { this.nombre = nombre == null ? null : nombre.trim(); }
    public void setContenido(String contenido) { this.contenido = contenido == null ? null : contenido.trim(); }
}