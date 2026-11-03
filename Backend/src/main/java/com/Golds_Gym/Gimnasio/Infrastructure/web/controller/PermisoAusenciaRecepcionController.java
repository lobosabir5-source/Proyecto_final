package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;
import com.Golds_Gym.Gimnasio.application.dto.PermisoAusenciaRespuesta;
import com.Golds_Gym.Gimnasio.application.service.PermisoAusenciaService;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recepcion/permisos")
public class PermisoAusenciaRecepcionController {
    private final PermisoAusenciaService permisos;

    public PermisoAusenciaRecepcionController(PermisoAusenciaService permisos)
    { this.permisos = permisos; }

    @GetMapping
    public Page<PermisoAusenciaRespuesta> listar(@PageableDefault(size = 10) Pageable pageable) {
        return permisos.listarTodos(pageable);
    }

    @PostMapping("/{id}/aprobar")
    public PermisoAusenciaRespuesta aprobar(@PathVariable Integer id) {
        return permisos.resolver(id, true); }

    @PostMapping("/{id}/rechazar")
    public PermisoAusenciaRespuesta rechazar(@PathVariable Integer id)
    { return permisos.resolver(id, false); }
}
