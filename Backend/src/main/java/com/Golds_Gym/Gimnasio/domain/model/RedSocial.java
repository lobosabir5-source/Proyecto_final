package com.Golds_Gym.Gimnasio.domain.model;
import jakarta.persistence.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name="redes_sociales")
public class RedSocial {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=70) private String plataforma;
 @Column(nullable=false,length=500) private String url;
 private String nombreUsuario;
 private String icono;
 private boolean activo = true;
 private int orden;
}
