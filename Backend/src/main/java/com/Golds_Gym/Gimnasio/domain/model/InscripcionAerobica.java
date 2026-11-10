package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "inscripciones_aerobicas", uniqueConstraints = @UniqueConstraint(columnNames = { "clase_id",
        "cliente_id" }))
public class InscripcionAerobica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "clase_id", nullable = false)
    private ClaseAerobica clase;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
    @Column(nullable = false)
    private LocalDateTime fechaInscripcion;
    private LocalDateTime llegadaCliente;
    private Boolean asistio;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado = Estado.INSCRITO;

    public enum Estado {
        INSCRITO, CANCELADO
    }
}
