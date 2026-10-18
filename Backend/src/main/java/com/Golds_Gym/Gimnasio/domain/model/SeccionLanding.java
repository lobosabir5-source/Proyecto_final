package com.Golds_Gym.Gimnasio.domain.model;
import jakarta.persistence.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name="secciones_landing")
public class SeccionLanding {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,unique=true,length=80) private String clave;
 private String titulo;
 @Column(length=4000) private String contenido;
 private String imagenUrl;
 private boolean visible = true;
 private int orden;
}
