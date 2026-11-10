package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;

@Service
public class AsistenciaPersonalService {
    private final AsistenciaPersonalRepository repo;
    private final PersonalRepository personalRepo;

    public AsistenciaPersonalService(AsistenciaPersonalRepository repo, PersonalRepository personalRepo) {
        this.repo = repo;
        this.personalRepo = personalRepo;
    }

    @Transactional(readOnly = true)
    public Page<AsistenciaPersonalRespuesta> listar(Long personalId, LocalDate desde, LocalDate hasta,
            AsistenciaPersonal.Turno turno, AsistenciaPersonal.Estado estado, int pagina) {
        if (pagina < 0 || (desde != null && hasta != null && desde.isAfter(hasta)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pagina o rango de fechas invalido");
        return repo
                .buscar(personalId, desde, hasta, turno, estado,
                        PageRequest.of(pagina, 10, Sort.by(Sort.Order.desc("fecha"), Sort.Order.desc("id"))))
                .map(AsistenciaPersonalRespuesta::desde);
    }

    @Transactional(readOnly = true)
    public AsistenciaPersonalRespuesta obtener(Long id) {
        return AsistenciaPersonalRespuesta.desde(encontrar(id));
    }

    @Transactional
    public AsistenciaPersonalRespuesta crear(GuardarAsistenciaPersonalRequest r) {
        if (repo.existsByPersonalIdAndFechaAndTurno(r.getPersonalId(), r.getFecha(), r.getTurno()))
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe asistencia para ese trabajador, fecha y turno");
        AsistenciaPersonal a = new AsistenciaPersonal();
        copiar(r, a);
        return AsistenciaPersonalRespuesta.desde(repo.saveAndFlush(a));
    }

    @Transactional
    public AsistenciaPersonalRespuesta actualizar(Long id, GuardarAsistenciaPersonalRequest r) {
        AsistenciaPersonal a = encontrar(id);
        if (repo.existsByPersonalIdAndFechaAndTurnoAndIdNot(r.getPersonalId(), r.getFecha(), r.getTurno(), id))
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe asistencia para ese trabajador, fecha y turno");
        copiar(r, a);
        return AsistenciaPersonalRespuesta.desde(repo.saveAndFlush(a));
    }

    @Transactional
    public void eliminar(Long id) {
        repo.delete(encontrar(id));
    }

    private AsistenciaPersonal encontrar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asistencia no encontrada"));
    }

    private void copiar(GuardarAsistenciaPersonalRequest r, AsistenciaPersonal a) {
        Personal p = personalRepo.findById(r.getPersonalId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personal no encontrado"));
        if (r.getFecha().isBefore(p.getFechaIngreso())
                || (p.getFechaSalida() != null && r.getFecha().isAfter(p.getFechaSalida())))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fecha fuera del periodo laboral");
        if (r.getEstado() == AsistenciaPersonal.Estado.AUSENTE || r.getEstado() == AsistenciaPersonal.Estado.PERMISO) {
            if (r.getHoraEntrada() != null || r.getHoraSalida() != null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Ausencia o permiso no debe tener horas de entrada o salida");
        } else if (r.getHoraEntrada() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hora de entrada requerida");
        if (r.getHoraSalida() != null && r.getHoraEntrada() != null && r.getHoraSalida().isBefore(r.getHoraEntrada()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Salida anterior a entrada");
        a.setPersonal(p);
        a.setFecha(r.getFecha());
        a.setTurno(r.getTurno());
        a.setEstado(r.getEstado());
        a.setHoraEntrada(r.getHoraEntrada());
        a.setHoraSalida(r.getHoraSalida());
        a.setObservaciones(r.getObservaciones());
    }
}
