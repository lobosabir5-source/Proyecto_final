package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;
import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.application.service.PermisoAusenciaService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cliente/permisos")
public class PermisoAusenciaClienteController {
    private final PermisoAusenciaService permisos;

    public PermisoAusenciaClienteController(PermisoAusenciaService permisos)
    { this.permisos = permisos; }

    @GetMapping
    public Page<PermisoAusenciaRespuesta> listar(Authentication auth, @PageableDefault(size = 10) Pageable pageable) {
        return permisos.listarDeUsuario(((Usuario) auth.getPrincipal()).getId(), pageable);
    }

    @PostMapping
    public PermisoAusenciaRespuesta solicitar(Authentication auth, @Valid @RequestBody SolicitarPermisoRequest req) {
        return permisos.solicitar(((Usuario) auth.getPrincipal()).getId(), req);
    }
}
