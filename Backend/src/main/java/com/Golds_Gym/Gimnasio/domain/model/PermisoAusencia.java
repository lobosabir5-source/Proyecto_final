package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "permisos_ausencion")
public class PermisoAusencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpermisos_ausencion")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membresia_id", nullable = false)
    private Membresia membresia;

    @Column(name = "motivo", nullable = false, length = 255)
    private String motivo;

    @Column(name = "dias_agregados", nullable = false)
    private Integer diasAgregados = 0;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20)
    private EstadoPermiso estado;

    @Column(name = "solicitado_en", nullable = false)
    private LocalDateTime solicitadoEn = LocalDateTime.now();

    @Column(name = "resuelto_en")
    private LocalDateTime resueltoEn;
}