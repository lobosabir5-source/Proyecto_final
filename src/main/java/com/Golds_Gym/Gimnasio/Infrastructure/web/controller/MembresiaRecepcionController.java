package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.CrearMembresiaRequest;
import com.Golds_Gym.Gimnasio.application.dto.MembresiaRespuesta;
import com.Golds_Gym.Gimnasio.application.service.MembresiaService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recepcion/membresias")
public class MembresiaRecepcionController {

    private final MembresiaService membresiaService;

    public MembresiaRecepcionController(MembresiaService membresiaService) {
        this.membresiaService = membresiaService;
    }

    @GetMapping
    public Page<MembresiaRespuesta> listar(@PageableDefault(size = 20) Pageable pageable) {
        return membresiaService.listar(pageable);
    }

    @PostMapping
    public ResponseEntity<MembresiaRespuesta> crear(
            @Valid @RequestBody CrearMembresiaRequest request,
            Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(membresiaService.crear(request, usuario));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        membresiaService.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}