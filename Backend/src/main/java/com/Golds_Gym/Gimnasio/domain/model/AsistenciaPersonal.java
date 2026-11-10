package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.*;

@Getter
@Setter
@Entity
@Table(name = "asistencias_personal", uniqueConstraints = @UniqueConstraint(name = "uk_asistencia_personal_fecha_turno", columnNames = {
        "personal_id", "fecha", "turno" }))
public class AsistenciaPersonal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "personal_id", nullable = false)
    private Personal personal;
    @Column(nullable = false)
    private LocalDate fecha;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Turno turno;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado;
    private LocalTime horaEntrada;
    private LocalTime horaSalida;
    @Column(length = 500)
    private String observaciones;
    @Column(nullable = false, updatable = false)
    private LocalDateTime registradoEn;
    private LocalDateTime actualizadoEn;

    @PrePersist
    void prePersist() {
        registradoEn = LocalDateTime.now();
        actualizadoEn = registradoEn;
    }

    @PreUpdate
    void preUpdate() {
        actualizadoEn = LocalDateTime.now();
    }

    public enum Turno {
        MANANA, TARDE, NOCHE
    }

    public enum Estado {
        PRESENTE, RETRASO, AUSENTE, PERMISO
    }
}
