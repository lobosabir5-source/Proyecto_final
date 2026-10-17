
package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "historial_membresia")
public class HistorialMembresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membresia_id", nullable = false)
    private Membresia membresia;

    @Column(name = "fecha_anterior")
    private LocalDate fechaAnterior;

    @Column(name = "fecha_nueva", nullable = false)
    private LocalDate fechaNueva;

    @Column(
            name = "precio_aplicado",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal precioAplicado;

    @Column(name = "fecha_operacion", nullable = false)
    private LocalDateTime fechaOperacion = LocalDateTime.now();

    @Column(nullable = false, length = 30)
    private String operacion;
}
