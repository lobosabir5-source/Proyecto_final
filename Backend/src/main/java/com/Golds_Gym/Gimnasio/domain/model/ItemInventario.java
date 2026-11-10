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
@Table(name = "inventario_general_items", indexes = { @Index(name = "idx_inv_categoria", columnList = "categoria") })
public class ItemInventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120)
    private String nombre;
    @Column(nullable = false, length = 30)
    private String categoria;
    @Column(nullable = false, length = 20)
    private String unidad;
    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal existencia = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal minimo = BigDecimal.ZERO;
    @Column(length = 255)
    private String descripcion;
    @Column(nullable = false)
    private boolean activo = true;
    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    void crearFecha() {
        if (creadoEn == null)
            creadoEn = LocalDateTime.now();
    }
}