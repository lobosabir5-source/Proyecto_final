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
@Table(name = "roles")
public class RolEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idroles")
    private Integer id;

    @Column(name = "nombre", nullable = false, length = 45)
    private String nombre;
}
