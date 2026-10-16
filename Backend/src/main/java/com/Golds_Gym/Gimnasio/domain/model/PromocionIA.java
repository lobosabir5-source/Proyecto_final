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
@Table(name = "promocion_IA")
public class PromocionIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpromocion_IA")
    private Integer id;

    @Column(name = "titulo", nullable = false, length = 100)
    private String titulo;

    @Column(name = "texto_publicictario", nullable = true, length = 255)
    private String textoPublicitario;

    @Column(name = "imagen_promt", nullable = true, length = 255)
    private String imagenPrompt;

    @Column(name = "imagen_url", nullable = true, length = 500)
    private String imagenUrl;

    @Column(name = "descuento_porcentaje", nullable = true, precision = 5, scale = 2)
    private BigDecimal descuentoPorcentaje;

    @Column(name = "fecha_inicio", nullable = true)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = true)
    private LocalDateTime fechaFin;

    @Column(name = "estado", nullable = false)
    private Byte estado;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;
}
