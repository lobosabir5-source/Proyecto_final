package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.domain.model.Personal;
import com.Golds_Gym.Gimnasio.domain.repository.PersonalRepository;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;

@Service
public class PersonalService {
    private final PersonalRepository repo;

    public PersonalService(PersonalRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public Page<PersonalRespuesta> listar(String texto, Personal.Cargo cargo,
            Personal.EstadoLaboral estado, int pagina) {
        if (pagina < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pagina invalida");
        return repo.buscar(texto == null || texto.isBlank() ? null : texto.trim(),
                cargo, estado, PageRequest.of(pagina, 10, Sort.by("id").descending()))
                .map(PersonalRespuesta::desde);
    }

    @Transactional(readOnly = true)
    public PersonalRespuesta obtener(Long id) {
        return PersonalRespuesta.desde(encontrar(id));
    }

    @Transactional
    public PersonalRespuesta crear(GuardarPersonalRequest r) {
        if (repo.existsByDocumento(r.getDocumento().trim()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Documento ya registrado");
        Personal p = new Personal();
        copiar(r, p);
        return PersonalRespuesta.desde(repo.save(p));
    }

    @Transactional
    public PersonalRespuesta actualizar(Long id, GuardarPersonalRequest r) {
        Personal p = encontrar(id);
        if (repo.existsByDocumentoAndIdNot(r.getDocumento().trim(), id))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Documento ya registrado");
        copiar(r, p);
        if (p.getFechaSalida() != null && p.getFechaSalida().isBefore(p.getFechaIngreso()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fecha de ingreso posterior a salida");
        return PersonalRespuesta.desde(repo.save(p));
    }

    @Transactional
    public PersonalRespuesta cambiarEstado(Long id, Personal.EstadoLaboral estado, LocalDate fechaSalida) {
        Personal p = encontrar(id);
        if (estado == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado requerido");
        if (estado == Personal.EstadoLaboral.RETIRADO) {
            if (fechaSalida == null || fechaSalida.isBefore(p.getFechaIngreso()))
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fecha de salida invalida");
            p.setFechaSalida(fechaSalida);
        } else {
            p.setFechaSalida(null);
        }
        p.setEstadoLaboral(estado);
        return PersonalRespuesta.desde(repo.save(p));
    }

    private Personal encontrar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personal no encontrado"));
    }

    private void copiar(GuardarPersonalRequest r, Personal p) {
        p.setNombres(r.getNombres().trim());
        p.setApellidos(r.getApellidos().trim());
        p.setDocumento(r.getDocumento().trim());
        p.setTelefono(r.getTelefono());
        p.setCorreo(r.getCorreo());
        p.setCargo(r.getCargo());
        p.setFechaIngreso(r.getFechaIngreso());
        p.setObservaciones(r.getObservaciones());
    }
}
