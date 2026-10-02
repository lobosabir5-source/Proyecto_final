package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.PagoRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.RegistrarPagoRequest;
import com.Golds_Gym.Gimnasio.domain.model.EstadoMembresia;
import com.Golds_Gym.Gimnasio.domain.model.Membresia;
import com.Golds_Gym.Gimnasio.domain.model.Pago;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.MembresiaRepository;
import com.Golds_Gym.Gimnasio.domain.repository.PagoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final MembresiaRepository membresiaRepository;

    public PagoService(PagoRepository pagoRepository, MembresiaRepository membresiaRepository) {
        this.pagoRepository = pagoRepository;
        this.membresiaRepository = membresiaRepository;
    }

    @Transactional
    public PagoRespuesta registrar(RegistrarPagoRequest request, Usuario registradoPor) {
        return null;
    }

    private void activarCuentaDeAutoRwgistro(Membresia membresia) {
    }

    @Transactional(readOnly = true)
    public List<PagoRespuesta> listarDeMembresia(Long membresiaId) {
        if (!membresiaRepository.existsById(membresiaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Membresía no encontrada");
        }
        return pagoRepository.findAllByMembresia_IdOrderByFechaPagoDesc(membresiaId)
                .stream().map(this::convertir).toList();
    }

    @Transactional(readOnly = true)
    public Page<PagoRespuesta> listarDeUsuario(Long usuarioId, Pageable pageable) {
        return pagoRepository.findAllByMembresia_Cliente_Usuario_IdOrderByFechaPagoDesc(usuarioId, pageable)
                .map(this::convertir);
    }

    private void activarCuentaDeAutoRegistro(Membresia membresia) {
        Usuario cuenta = membresia.getCliente().getUsuario();
        if (!cuenta.isActivo() && membresia.getCreadaPor().getId().equals(cuenta.getId())) {
            cuenta.setActivo(true);
        }
    }

    private void actualizarVencimiento(Membresia membresia) {
        if ((membresia.getEstado() == EstadoMembresia.ACTIVA
                || membresia.getEstado() == EstadoMembresia.PENDIENTE)
                && membresia.getFechaFin().isBefore(LocalDate.now())) {
            membresia.setEstado(EstadoMembresia.VENCIDA);
        }
    }

    private PagoRespuesta convertir(Pago pago) {
        return new PagoRespuesta(
                pago.getId(),
                pago.getMembresia().getId(),
                pago.getMembresia().getCliente().getNombre(),
                pago.getMonto(),
                pago.getMetodo(),
                pago.getFechaPago(),
                pago.getRegistradoPor().getUsuario());
    }
}