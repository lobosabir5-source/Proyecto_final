package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "ejerccios_rutina")
public class EjercicioRutina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idejerccios_rutina")
    private Integer id;

    @Column(name = "dia_num", nullable = false)
    private Integer diaNum;

    @Column(name = "grupo_muscular", nullable = true, length = 45)
    private String grupoMuscular;

    @Column(name = "nombre_ejercicio", nullable = false, length = 100)
    private String nombreEjercicio;

    @Column(name = "series", nullable = true)
    private Integer series;

    @Column(name = "repeticiones", nullable = true, length = 20)
    private String repeticiones;

    @Column(name = "descanso_sec", nullable = true)
    private Integer descansoSec;

    @Column(name = "notas_tecnicas", nullable = true, length = 45)
    private String notasTecnicas;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rutina_id", nullable = false)
    private Rutina rutina;
}
