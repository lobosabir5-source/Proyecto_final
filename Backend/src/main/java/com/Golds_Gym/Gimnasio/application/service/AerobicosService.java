package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;

@Service
public class AerobicosService {
    private final ClaseAerobicaRepository clases;
    private final InscripcionAerobicaRepository inscripciones;
    private final PersonalRepository personal;
    private final ClienteRepository clientes;
    private final EntityManager em;

    public AerobicosService(ClaseAerobicaRepository clases, InscripcionAerobicaRepository inscripciones,
            PersonalRepository personal, ClienteRepository clientes, EntityManager em) {
        this.clases = clases;
        this.inscripciones = inscripciones;
        this.personal = personal;
        this.clientes = clientes;
        this.em = em;
    }

    private ResponseStatusException error(HttpStatus status, String mensaje) {
        return new ResponseStatusException(status, mensaje);
    }

    private ClaseAerobica clase(Long id) {
        return clases.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Clase no encontrada"));
    }

    private InscripcionAerobica inscripcion(Long id) {
        return inscripciones.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Inscripcion no encontrada"));
    }

    private void validar(GuardarClaseAerobicaRequest r, Long id) {
        if (!r.horaFin().isAfter(r.horaInicio()))
            throw error(HttpStatus.BAD_REQUEST, "La hora fin debe ser posterior a la hora inicio");
        if (clases.existsByInstructorIdAndFechaAndHoraInicioLessThanAndHoraFinGreaterThanAndEstadoNotAndIdNot(
                r.instructorId(), r.fecha(), r.horaFin(), r.horaInicio(), ClaseAerobica.Estado.CANCELADA, id))
            throw error(HttpStatus.CONFLICT, "El instructor ya tiene otra clase en ese horario");
    }

    private Personal instructor(Long id) {
        Personal p = personal.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Instructor no encontrado"));
        if (p.getCargo() != Personal.Cargo.INSTRUCTOR || p.getEstadoLaboral() != Personal.EstadoLaboral.ACTIVO)
            throw error(HttpStatus.BAD_REQUEST, "Debe asignar un instructor activo");
        return p;
    }

    private ClaseAerobicaRespuesta respuesta(ClaseAerobica c) {
        long n = inscripciones.countByClaseIdAndEstado(c.getId(), InscripcionAerobica.Estado.INSCRITO);
        Long retraso = c.getLlegadaInstructor() == null ? null
                : Math.max(0,
                        Duration.between(LocalDateTime.of(c.getFecha(), c.getHoraInicio()), c.getLlegadaInstructor())
                                .toMinutes());
        return new ClaseAerobicaRespuesta(c.getId(), c.getNombre(), c.getDescripcion(), c.getInstructor().getId(),
                c.getInstructor().getNombres() + " " + c.getInstructor().getApellidos(), c.getFecha(),
                c.getHoraInicio(), c.getHoraFin(), c.getCupoMaximo(), n, Math.max(0, c.getCupoMaximo() - n),
                c.getEstado().name(), c.getLlegadaInstructor(), retraso);
    }

    private InscripcionAerobicaRespuesta respuesta(InscripcionAerobica i) {
        Integer orden = null;
        if (i.getLlegadaCliente() != null) {
            List<InscripcionAerobica> lista = inscripciones
                    .findByClaseIdAndLlegadaClienteIsNotNullOrderByLlegadaClienteAscIdAsc(i.getClase().getId());
            for (int x = 0; x < lista.size(); x++)
                if (lista.get(x).getId().equals(i.getId())) {
                    orden = x + 1;
                    break;
                }
        }
        return new InscripcionAerobicaRespuesta(i.getId(), i.getClase().getId(), i.getCliente().getId(),
                i.getCliente().getNombre(), i.getFechaInscripcion(), i.getLlegadaCliente(), i.getAsistio(),
                i.getEstado().name(), orden);
    }

    @Transactional(readOnly = true)
    public Page<ClaseAerobicaRespuesta> listar(LocalDate fecha, int pagina) {
        Pageable p = PageRequest.of(Math.max(0, pagina), 10, Sort.by("fecha", "horaInicio"));
        return (fecha == null ? clases.findAll(p) : clases.findByFecha(fecha, p)).map(this::respuesta);
    }

    @Transactional(readOnly = true)
    public ClaseAerobicaRespuesta obtener(Long id) {
        return respuesta(clase(id));
    }

    @Transactional
    public ClaseAerobicaRespuesta crear(GuardarClaseAerobicaRequest r) {
        validar(r, -1L);
        ClaseAerobica c = new ClaseAerobica();
        asignar(c, r);
        return respuesta(clases.saveAndFlush(c));
    }

    private void asignar(ClaseAerobica c, GuardarClaseAerobicaRequest r) {
        c.setNombre(r.nombre());
        c.setDescripcion(r.descripcion());
        c.setInstructor(instructor(r.instructorId()));
        c.setFecha(r.fecha());
        c.setHoraInicio(r.horaInicio());
        c.setHoraFin(r.horaFin());
        c.setCupoMaximo(r.cupoMaximo());
    }

    @Transactional
    public ClaseAerobicaRespuesta editar(Long id, GuardarClaseAerobicaRequest r) {
        ClaseAerobica c = clase(id);
        if (c.getEstado() != ClaseAerobica.Estado.PROGRAMADA)
            throw error(HttpStatus.CONFLICT, "Solo se editan clases programadas");
        validar(r, id);
        if (inscripciones.countByClaseIdAndEstado(id, InscripcionAerobica.Estado.INSCRITO) > r.cupoMaximo())
            throw error(HttpStatus.CONFLICT, "Cupo menor a las inscripciones existentes");
        asignar(c, r);
        return respuesta(clases.saveAndFlush(c));
    }

    @Transactional
    public ClaseAerobicaRespuesta estado(Long id, ClaseAerobica.Estado estado) {
        ClaseAerobica c = clase(id);
        if (c.getEstado() != ClaseAerobica.Estado.PROGRAMADA)
            throw error(HttpStatus.CONFLICT, "La clase ya fue cerrada");
        if (estado == ClaseAerobica.Estado.PROGRAMADA)
            throw error(HttpStatus.BAD_REQUEST, "Estado invalido");
        c.setEstado(estado);
        return respuesta(c);
    }

    @Transactional
    public ClaseAerobicaRespuesta llegadaInstructor(Long id, LocalDateTime momento) {
        ClaseAerobica c = clase(id);
        if (c.getEstado() != ClaseAerobica.Estado.PROGRAMADA)
            throw error(HttpStatus.CONFLICT, "Clase no programada");
        if (c.getLlegadaInstructor() != null)
            throw error(HttpStatus.CONFLICT, "Llegada del instructor ya registrada");
        c.setLlegadaInstructor(momento == null ? LocalDateTime.now() : momento);
        return respuesta(c);
    }

    @Transactional
    public InscripcionAerobicaRespuesta inscribir(Long claseId, Long clienteId) {
        ClaseAerobica c = clase(claseId);
        em.lock(c, LockModeType.PESSIMISTIC_WRITE);
        if (c.getEstado() != ClaseAerobica.Estado.PROGRAMADA)
            throw error(HttpStatus.CONFLICT, "Clase no disponible");
        if (!LocalDateTime.now().isBefore(LocalDateTime.of(c.getFecha(), c.getHoraFin())))
            throw error(HttpStatus.CONFLICT, "Clase ya terminada");
        Cliente cliente = clientes.findById(clienteId)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        Optional<InscripcionAerobica> previa = inscripciones.findByClaseIdAndClienteId(claseId, clienteId);
        if (previa.isPresent() && previa.get().getEstado() == InscripcionAerobica.Estado.INSCRITO)
            throw error(HttpStatus.CONFLICT, "Cliente ya inscrito");
        if (inscripciones.countByClaseIdAndEstado(claseId, InscripcionAerobica.Estado.INSCRITO) >= c.getCupoMaximo())
            throw error(HttpStatus.CONFLICT, "No hay cupos disponibles");
        InscripcionAerobica i = previa.orElseGet(InscripcionAerobica::new);
        i.setClase(c);
        i.setCliente(cliente);
        i.setEstado(InscripcionAerobica.Estado.INSCRITO);
        i.setFechaInscripcion(LocalDateTime.now());
        i.setLlegadaCliente(null);
        i.setAsistio(null);
        return respuesta(inscripciones.saveAndFlush(i));
    }

    @Transactional(readOnly = true)
    public Page<InscripcionAerobicaRespuesta> inscripciones(Long id, int pagina) {
        clase(id);
        return inscripciones
                .findByClaseId(id, PageRequest.of(Math.max(0, pagina), 10, Sort.by("fechaInscripcion", "id")))
                .map(this::respuesta);
    }

    @Transactional
    public InscripcionAerobicaRespuesta llegadaCliente(Long id, LocalDateTime momento) {
        InscripcionAerobica i = inscripcion(id);
        if (i.getEstado() != InscripcionAerobica.Estado.INSCRITO
                || i.getClase().getEstado() != ClaseAerobica.Estado.PROGRAMADA)
            throw error(HttpStatus.CONFLICT, "Inscripcion no activa");
        if (i.getLlegadaCliente() != null)
            throw error(HttpStatus.CONFLICT, "Llegada ya registrada");
        i.setLlegadaCliente(momento == null ? LocalDateTime.now() : momento);
        return respuesta(inscripciones.saveAndFlush(i));
    }

    @Transactional
    public InscripcionAerobicaRespuesta asistencia(Long id, boolean asistio) {
        InscripcionAerobica i = inscripcion(id);
        if (i.getEstado() != InscripcionAerobica.Estado.INSCRITO
                || i.getClase().getEstado() == ClaseAerobica.Estado.CANCELADA)
            throw error(HttpStatus.CONFLICT, "Inscripcion no activa");
        i.setAsistio(asistio);
        return respuesta(i);
    }

    @Transactional
    public InscripcionAerobicaRespuesta cancelar(Long id) {
        InscripcionAerobica i = inscripcion(id);
        if (i.getEstado() != InscripcionAerobica.Estado.INSCRITO)
            throw error(HttpStatus.CONFLICT, "Ya cancelada");
        if (i.getClase().getEstado() != ClaseAerobica.Estado.PROGRAMADA)
            throw error(HttpStatus.CONFLICT, "Clase cerrada");
        i.setEstado(InscripcionAerobica.Estado.CANCELADO);
        return respuesta(i);
    }
}
