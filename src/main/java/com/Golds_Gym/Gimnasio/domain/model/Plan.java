package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "planes")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "duracion_dias", nullable = false)
    private int duracionDias;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(length = 200)
    private String horario;

    @Column(length = 1000)
    private String beneficios;

    @Column(name = "imagen_url", length = 300)
    private String imagenUrl;

    @Column(nullable = false, columnDefinition = "boolean not null default false")
    private boolean destacado = false;

    @Column(nullable = false, columnDefinition = "integer not null default 0")
    private int orden = 0;

    protected Plan() {
    }

    public Plan(String nombre, String descripcion, int duracionDias, BigDecimal precio) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.duracionDias = duracionDias;
        this.precio = precio;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public int getDuracionDias() {
        return duracionDias;
    }

    public void setDuracionDias(int duracionDias) {
        this.duracionDias = duracionDias;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }

    public String getBeneficios() { return beneficios; }
    public void setBeneficios(String beneficios) { this.beneficios = beneficios; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public boolean isDestacado() { return destacado; }
    public void setDestacado(boolean destacado) { this.destacado = destacado; }

    public int getOrden() { return orden; }
    public void setOrden(int orden) { this.orden = orden; }
}