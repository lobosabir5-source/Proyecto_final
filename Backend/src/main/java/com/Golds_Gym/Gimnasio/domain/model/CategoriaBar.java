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
@Table(name = "categorias_bar")
public class CategoriaBar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idcategorias_bar")
    private Integer id;

    @Column(name = "nombre", nullable = false, length = 60)
    private String nombre;

    @Column(name = "descripcion", nullable = true, length = 255)
    private String descripcion;

    @Column(name = "estado", nullable = false)
    private Byte estado;
}
