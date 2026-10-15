package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class GuardarRutinaRequest {
    @NotNull(message = "El cliente es obligatorio")
    @Positive(message = "El cliente no es válido")
    private Long clienteId;
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
    private String nombre;
    @NotBlank(message = "El contenido es obligatorio")
    @Size(max = 10000, message = "El contenido no puede superar 10000 caracteres")
    private String contenido;

    public GuardarRutinaRequest() { }
    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre == null ? null : nombre.trim(); }
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido == null ? null : contenido.trim(); }
}