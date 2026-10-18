package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "telefonos_contacto")
public class TelefonoContacto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 40)
    private String numero;
    private String etiqueta;
    private boolean whatsapp;
    private boolean principal;
    private boolean activo = true;
    private int orden;
}
