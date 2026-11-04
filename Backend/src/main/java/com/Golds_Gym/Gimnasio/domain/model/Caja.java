package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "cajas")
public class Caja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;
    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;
    @Column(name = "monto_inicial", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoInicial;
    @Column(name = "efectivo_contado", precision = 12, scale = 2)
    private BigDecimal efectivoContado;
    @Column(name = "observaciones", length = 500)
    private String observaciones;
    @Column(nullable = false, length = 10)
    private String estado;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "abierta_por_id", nullable = false)
    private Usuario abiertaPor;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cerrada_por_id")
    private Usuario cerradaPor;
}
