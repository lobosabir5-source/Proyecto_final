package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "personal")
public class Personal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String nombres;
    @Column(nullable = false, length = 100)
    private String apellidos;
    @Column(nullable = false, unique = true, length = 30)
    private String documento;
    @Column(length = 30)
    private String telefono;
    @Column(length = 150)
    private String correo;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Cargo cargo;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoLaboral estadoLaboral = EstadoLaboral.ACTIVO;
    @Column(nullable = false)
    private LocalDate fechaIngreso;
    private LocalDate fechaSalida;
    @Column(length = 500)
    private String observaciones;

    public enum Cargo {
        ADMINISTRATIVO, INSTRUCTOR, LIMPIEZA
    }

    public enum EstadoLaboral {
        ACTIVO, INACTIVO, SUSPENDIDO, RETIRADO
    }
}
