package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.ActualizarRutinaRequest;
import com.Golds_Gym.Gimnasio.application.dto.GuardarRutinaRequest;
import com.Golds_Gym.Gimnasio.application.dto.RutinaRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.Cliente;
import com.Golds_Gym.Gimnasio.domain.model.Rutina;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import com.Golds_Gym.Gimnasio.domain.repository.ClienteRepository;
import com.Golds_Gym.Gimnasio.domain.repository.RutinaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final ClienteRepository clienteRepository;

    public RutinaService(RutinaRepository rutinaRepository, ClienteRepository clienteRepository) {
        this.rutinaRepository = rutinaRepository;
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public RutinaRespuesta crear(GuardarRutinaRequest request, Usuario creadaPor) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        if (!cliente.getUsuario().isActivo()) {
            throw new IllegalArgumentException("No se puede asignar una rutina a un cliente inactivo");
        }
        return convertir(rutinaRepository.save(new Rutina(
            cliente, creadaPor, request.getNombre(), request.getContenido())));
    }

    @Transactional(readOnly = true)
    public Page<RutinaRespuesta> listarDeCliente(Long clienteId, Pageable pageable) {
        return rutinaRepository.findAllByCliente_IdAndActivaTrueOrderByFechaCreacionDesc(clienteId, pageable)
                .map(this::convertir);
    }

    @Transactional(readOnly = true)
    public Page<RutinaRespuesta> listarDeUsuario(Long usuarioId, Pageable pageable) {
        return rutinaRepository.findAllByCliente_Usuario_IdAndActivaTrueOrderByFechaCreacionDesc(usuarioId, pageable)
                .map(this::convertir);
    }

    @Transactional
    public RutinaRespuesta actualizar(Long id, ActualizarRutinaRequest request) {
        Rutina rutina = buscarPorId(id);
        rutina.setNombre(request.getNombre());
        rutina.setContenido(request.getContenido());
        return convertir(rutinaRepository.save(rutina));
    }

    @Transactional
    public void desactivar(Long id) {
        buscarPorId(id).setActiva(false);
    }

    private Rutina buscarPorId(Long id) {
        return rutinaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rutina no encontrada"));
    }

    private RutinaRespuesta convertir(Rutina rutina) {
        return new RutinaRespuesta(
                rutina.getId(),
                rutina.getCliente().getId(),
                rutina.getCliente().getNombre(),
                rutina.getNombre(),
                rutina.getContenido(),
                rutina.getFechaCreacion(),
                rutina.isActiva());
    }
}