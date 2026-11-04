package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "movimientos_caja", uniqueConstraints = @UniqueConstraint(name = "uq_movimiento_origen", columnNames = {
        "origen_tipo", "origen_id" }))
public class MovimientoCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "caja_id", nullable = false)
    private Caja caja;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    @Column(nullable = false, length = 10)
    private String tipo;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MetodoPago metodo;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;
    @Column(nullable = false, length = 250)
    private String concepto;
    @Column(nullable = false)
    private LocalDateTime fecha;
    @Column(name = "origen_tipo", length = 40)
    private String origenTipo;
    @Column(name = "origen_id")
    private Long origenId;
}
