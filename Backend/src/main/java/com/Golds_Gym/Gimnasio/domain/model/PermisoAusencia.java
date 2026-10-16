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
@Table(name = "permisos_ausencion")
public class PermisoAusencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpermisos_ausencion")
    private Integer id;

    @Column(name = "motivo", nullable = false, length = 255)
    private String motivo;

    @Column(name = "dias_agregados", nullable = false)
    private Integer diasAgregados;

    @Column(name = "solicitado_en", nullable = false)
    private LocalDateTime solicitadoEn;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membresia_id", nullable = false)
    private Membresia membresia;
}
