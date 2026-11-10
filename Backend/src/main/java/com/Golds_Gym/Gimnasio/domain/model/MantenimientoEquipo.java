package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "mantenimientos_equipos", uniqueConstraints = @UniqueConstraint(columnNames = { "equipo_id",
        "fecha_programada" }))
public class MantenimientoEquipo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_id", nullable = false)
    private Equipo equipo;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private Personal tecnico;
    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;
    private LocalDate fechaRealizada;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private Estado estado = Estado.PENDIENTE;
    @Column(length = 1000)
    private String trabajoRealizado;
    @Column(length = 1000)
    private String observaciones;

    public enum Estado {
        PENDIENTE, REALIZADO, CANCELADO
    }
}
