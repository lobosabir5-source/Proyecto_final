package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membresia_id", nullable = false)
    private Membresia membresia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registrado_por_id", nullable = false)
    private Usuario registradoPor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MetodoPago metodo;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;

    protected Pago() {
    }

    public Pago(Membresia membresia, Usuario registradoPor, BigDecimal monto, MetodoPago metodo) {
        this.membresia = membresia;
        this.registradoPor = registradoPor;
        this.monto = monto;
        this.metodo = metodo;
        this.fechaPago = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Membresia getMembresia() {
        return membresia;
    }

    public Usuario getRegistradoPor() {
        return registradoPor;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public MetodoPago getMetodo() {
        return metodo;
    }

    public LocalDateTime getFechaPago() {
        return fechaPago;
    }
}