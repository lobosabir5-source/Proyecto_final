package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.PagoRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.RegistrarPagoRequest;
import com.Golds_Gym.Gimnasio.application.service.PagoService;
import com.Golds_Gym.Gimnasio.domain.model.Usuario;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recepcion/pagos")
public class PagoRecepcionController {

    private final PagoService pagoService;

    public PagoRecepcionController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping
    public ResponseEntity<PagoRespuesta> registrar(
            @Valid @RequestBody RegistrarPagoRequest request,
            Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.registrar(request, usuario));
    }

    @GetMapping("/membresia/{membresiaId}")
    public List<PagoRespuesta> listarDeMembresia(@PathVariable Long membresiaId) {
        return pagoService.listarDeMembresia(membresiaId);
    }
}