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
@Table(name = "inventario_general_movimientos", indexes = {
        @Index(name = "idx_mov_item_fecha", columnList = "item_id,fecha") })
public class MovimientoInventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false, updatable = false)
    private ItemInventario item;
    @Column(nullable = false, length = 12, updatable = false)
    private String tipo;
    @Column(nullable = false, precision = 14, scale = 3, updatable = false)
    private BigDecimal cantidad;
    @Column(nullable = false, precision = 14, scale = 3, updatable = false)
    private BigDecimal saldoAnterior;
    @Column(nullable = false, precision = 14, scale = 3, updatable = false)
    private BigDecimal saldoPosterior;
    @Column(nullable = false, length = 150, updatable = false)
    private String responsable;
    @Column(length = 255, updatable = false)
    private String motivo;
    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @PrePersist
    void crearFecha() {
        if (fecha == null)
            fecha = LocalDateTime.now();
    }
}