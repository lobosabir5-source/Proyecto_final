package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.DayOfWeek;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "equipos")
public class Equipo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 40)
    private String codigo;
    @Column(nullable = false, length = 120)
    private String nombre;
    @Column(nullable = false, length = 60)
    private String tipo;
    @Column(length = 120)
    private String ubicacion;
    @Column(length = 500)
    private String descripcion;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Estado estado = Estado.OPERATIVO;
    @Column(nullable = false)
    private Boolean mantenimientoActivo = true;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private DayOfWeek diaUno = DayOfWeek.MONDAY;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private DayOfWeek diaDos = DayOfWeek.THURSDAY;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private com.Golds_Gym.Gimnasio.domain.model.Personal tecnico;
    private LocalDate fechaAlta;

    public enum Estado {
        OPERATIVO, EN_MANTENIMIENTO, FUERA_DE_SERVICIO
    }
}
