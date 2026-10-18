package com.Golds_Gym.Gimnasio.application.dto;
import jakarta.validation.constraints.*;
public record GuardarConfiguracionSolicitud(
 @NotBlank @Size(max=150) String nombreComercial,
 @Email String correoContacto,
 @Size(max=2000) String descripcion,
 String direccion, String logoUrl, String portadaUrl,
 @Pattern(regexp="^#[0-9a-fA-F]{6}$") String colorPrimario,
 @Pattern(regexp="^#[0-9a-fA-F]{6}$") String colorSecundario) {}
