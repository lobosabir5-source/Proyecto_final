package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
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
public Plan(String nombre, String descripcion, int duracionDias, BigDecimal precio) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.duracionDias = duracionDias;
        this.precio = precio;
    }

}
