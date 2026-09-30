package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.AsistenciaRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.RegistrarAsistenciaRequest;
import com.Golds_Gym.Gimnasio.application.service.AsistenciaService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/recepcion/asistencias")
public class AsistenciaRecepcionController {

    private final AsistenciaService asistenciaService;

    public AsistenciaRecepcionController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @GetMapping
    public Page<AsistenciaRespuesta> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @PageableDefault(size = 50) Pageable pageable) {
        return asistenciaService.listarDelDia(fecha == null ? LocalDate.now() : fecha, pageable);
    }

    @PostMapping
    public ResponseEntity<AsistenciaRespuesta> registrar(
            @Valid @RequestBody RegistrarAsistenciaRequest request,
            Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(asistenciaService.registrar(request, usuario));
    }
}