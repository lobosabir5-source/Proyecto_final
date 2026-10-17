package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.service.FotografiaClienteService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/recepcion/clientes")
@PreAuthorize("hasAnyRole('ADMIN','RECEPCION')")
public class FotografiaClienteController {
    private final FotografiaClienteService servicio;

    public FotografiaClienteController(FotografiaClienteService servicio) {
        this.servicio = servicio;
    }

    @PostMapping(value = "/{id}/fotografia", consumes = "multipart/form-data")
    public Map<String, String> subir(@PathVariable Long id, @RequestPart("archivo") MultipartFile archivo)
            throws IOException {
        return Map.of("fotoUrl", servicio.guardar(id, archivo));
    }
}
