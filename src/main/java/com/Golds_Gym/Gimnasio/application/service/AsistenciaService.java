package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.AsistenciaRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.RegistrarAsistenciaRequest;
import com.Golds_Gym.Gimnasio.domain.model.Asistencia;
import com.Golds_Gym.Gimnasio.domain.model.Cliente;
import com.Golds_Gym.Gimnasio.domain.model.EstadoMembresia;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.AsistenciaRepository;
import com.Golds_Gym.Gimnasio.domain.repository.ClienteRepository;
import com.Golds_Gym.Gimnasio.domain.repository.MembresiaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final ClienteRepository clienteRepository;
    private final MembresiaRepository membresiaRepository;

    public AsistenciaService(
            AsistenciaRepository asistenciaRepository,
            ClienteRepository clienteRepository,
            MembresiaRepository membresiaRepository) {
        this.asistenciaRepository = asistenciaRepository;
        this.clienteRepository = clienteRepository;
        this.membresiaRepository = membresiaRepository;
    }

    @Transactional
    public AsistenciaRespuesta registrar(RegistrarAsistenciaRequest request, Usuario registradaPor) {
        Cliente cliente = clienteRepository.findById(request.clienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        if (!cliente.getUsuario().isActivo()) {
            throw new IllegalArgumentException("El cliente está inactivo");
        }

        LocalDate hoy = LocalDate.now();
        boolean tieneMembresiaActiva = membresiaRepository
                .findFirstByCliente_IdAndEstadoAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqualOrderByFechaFinDesc(
                        cliente.getId(), EstadoMembresia.ACTIVA, hoy, hoy)
                .isPresent();
        if (!tieneMembresiaActiva) {
            throw new IllegalArgumentException("El cliente no tiene una membresía activa vigente");
        }
        if (asistenciaRepository.existsByCliente_IdAndFecha(cliente.getId(), hoy)) {
            throw new IllegalArgumentException("Ya se registró la entrada de este cliente hoy");
        }
        return convertir(asistenciaRepository.save(new Asistencia(cliente, registradaPor)));
    }

    @Transactional(readOnly = true)
    public Page<AsistenciaRespuesta> listarDelDia(LocalDate fecha, Pageable pageable) {
        return asistenciaRepository.findAllByFechaOrderByHoraEntradaDesc(fecha, pageable).map(this::convertir);
    }

    @Transactional(readOnly = true)
    public Page<AsistenciaRespuesta> listarDeUsuario(Long usuarioId, Pageable pageable) {
        return asistenciaRepository.findAllByCliente_Usuario_IdOrderByHoraEntradaDesc(usuarioId, pageable)
                .map(this::convertir);
    }

    private AsistenciaRespuesta convertir(Asistencia asistencia) {
        return new AsistenciaRespuesta(
                asistencia.getId(),
                asistencia.getCliente().getId(),
                asistencia.getCliente().getNombre(),
                asistencia.getFecha(),
                asistencia.getHoraEntrada(),
                asistencia.getRegistradaPor().getUsuario());
    }
}