package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.PersonalService;
import com.Golds_Gym.Gimnasio.domain.model.Personal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/personal")
public class PersonalController {
    private final PersonalService service;

    public PersonalController(PersonalService service) {
        this.service = service;
    }

    @GetMapping
    public Page<PersonalRespuesta> listar(@RequestParam(required = false) String texto,
            @RequestParam(required = false) Personal.Cargo cargo,
            @RequestParam(required = false) Personal.EstadoLaboral estado,
            @RequestParam(defaultValue = "0") int pagina) {
        return service.listar(texto, cargo, estado, pagina);
    }

    @GetMapping("/{id}")
    public PersonalRespuesta obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PersonalRespuesta crear(@Valid @RequestBody GuardarPersonalRequest r) {
        return service.crear(r);
    }

    @PutMapping("/{id}")
    public PersonalRespuesta actualizar(@PathVariable Long id, @Valid @RequestBody GuardarPersonalRequest r) {
        return service.actualizar(id, r);
    }

    @PatchMapping("/{id}/estado")
    public PersonalRespuesta cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        return service.cambiarEstado(id, r.estadoLaboral(), r.fechaSalida());
    }

    public record EstadoRequest(@NotNull Personal.EstadoLaboral estadoLaboral, LocalDate fechaSalida) {
    }
}
