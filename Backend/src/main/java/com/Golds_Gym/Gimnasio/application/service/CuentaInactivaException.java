package com.Golds_Gym.Gimnasio.application.service;

// Error propio para "tu cuenta existe pero no está activa"
public class CuentaInactivaException extends RuntimeException {

    public CuentaInactivaException(String mensaje) {
        super(mensaje);
    }
}