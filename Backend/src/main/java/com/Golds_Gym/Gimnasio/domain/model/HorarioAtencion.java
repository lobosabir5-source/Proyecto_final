package com.Golds_Gym.Gimnasio.domain.model;
import jakarta.persistence.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name="horarios_atencion")
public class HorarioAtencion {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Integer diaSemana;
 private java.time.LocalTime apertura;
 private java.time.LocalTime cierre;
 private boolean cerrado;
}
