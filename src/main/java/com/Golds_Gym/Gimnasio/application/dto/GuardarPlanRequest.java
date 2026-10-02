package com.Golds_Gym.Gimnasio.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class GuardarPlanRequest {
    @NotBlank(message = "El nombre del plan es obligatorio")
    @Size(max = 80, message = "El nombre no puede superar 80 caracteres")
    private String nombre;
    @Size(max = 500, message = "La descripción no puede superar 500 caracteres")
    private String descripcion;
    @Min(value = 1, message = "La duración debe ser de al menos un día")
    private int duracionDias;
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a cero")
    @Digits(integer = 8, fraction = 2, message = "El precio admite hasta 8 enteros y 2 decimales")
    private BigDecimal precio;

    // ---- Campos nuevos ----
    @Size(max = 200, message = "El horario no puede superar 200 caracteres")
    private String horario;

    // Máximo 8 beneficios, cada uno de hasta 120 caracteres
    @Size(max = 8, message = "Un plan admite hasta 8 beneficios")
    private List<@Size(max = 120, message = "Cada beneficio admite hasta 120 caracteres") String> beneficios = new ArrayList<>();

    private boolean destacado;

    @Min(value = 0, message = "El orden no puede ser negativo")
    @Max(value = 999, message = "El orden no puede superar 999")
    private int orden;

    public GuardarPlanRequest() { }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre == null ? null : nombre.trim(); }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion == null ? null : descripcion.trim(); }
    public int getDuracionDias() { return duracionDias; }
    public void setDuracionDias(int duracionDias) { this.duracionDias = duracionDias; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getHorario() { return horario; }
    public void setHorario(String horario) {
        this.horario = horario == null || horario.isBlank() ? null : horario.trim();
    }

    public List<String> getBeneficios() { return beneficios; }
    public void setBeneficios(List<String> beneficios) {
        this.beneficios = beneficios == null
                ? new ArrayList<>()
                : beneficios.stream().filter(b -> b != null && !b.isBlank()).map(String::trim).toList();
    }

    public boolean isDestacado() { return destacado; }
    public void setDestacado(boolean destacado) { this.destacado = destacado; }
    public int getOrden() { return orden; }
    public void setOrden(int orden) { this.orden = orden; }
}