package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "clientes")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;
    @Column(nullable = false, length = 120)
    private String nombre;
    @Column(nullable = false, unique = true, length = 160)
    private String correo;
    @Column(nullable = false, length = 30)
    private String telefono;
    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;
    @Column(name = "numero_documento", length = 40, unique = true)
    private String numeroDocumento;
    @Column(name = "foto_url", length = 350)
    private String fotoUrl;
    @Column(name = "fecha_alta", nullable = false)
    private LocalDate fechaAlta;

    public Cliente(Usuario usuario, String nombre, String correo, String telefono, LocalDate fechaNacimiento) {
        this.usuario = usuario;
        this.nombre = nombre;
        this.correo = correo;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.fechaAlta = LocalDate.now();
    }
}
