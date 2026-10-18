package com.Golds_Gym.Gimnasio.domain.model;
import jakarta.persistence.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name="configuracion_gimnasio")
public class ConfiguracionGimnasio {
 @Id private Long id;
 @Column(nullable=false,length=150) private String nombreComercial = "Gold’s Gym";
 private String correoContacto;
 @Column(length=2000) private String descripcion;
 private String direccion;
 private String logoUrl;
 private String portadaUrl;
 private String colorPrimario = "#D4AF37";
 private String colorSecundario = "#171717";
}
