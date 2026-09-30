package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.ActualizarRutinaRequest;
import com.Golds_Gym.Gimnasio.application.dto.GuardarRutinaRequest;
import com.Golds_Gym.Gimnasio.application.dto.RutinaRespuesta;
import com.Golds_Gym.Gimnasio.application.service.RutinaService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recepcion/rutinas")
public class RutinaRecepcionController {

    private final RutinaService rutinaService;

    public RutinaRecepcionController(RutinaService rutinaService) {
        this.rutinaService = rutinaService;
    }

    @GetMapping("/cliente/{clienteId}")
    public Page<RutinaRespuesta> listarDeCliente(
            @PathVariable Long clienteId,
            @PageableDefault(size = 20) Pageable pageable) {
        return rutinaService.listarDeCliente(clienteId, pageable);
    }

    @PostMapping
    public ResponseEntity<RutinaRespuesta> crear(
            @Valid @RequestBody GuardarRutinaRequest request,
            Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(rutinaService.crear(request, usuario));
    }

    @PutMapping("/{id}")
    public RutinaRespuesta actualizar(@PathVariable Long id, @Valid @RequestBody ActualizarRutinaRequest request) {
        return rutinaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        rutinaService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}