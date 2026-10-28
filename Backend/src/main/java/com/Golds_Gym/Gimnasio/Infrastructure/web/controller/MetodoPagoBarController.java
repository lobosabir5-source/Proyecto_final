
package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.domain.repository.MetodoPagoBarRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/metodos-pago-bar")
public class MetodoPagoBarController {

    private final MetodoPagoBarRepository repository;

    public MetodoPagoBarController(MetodoPagoBarRepository repository) {
        this.repository = repository;
    }

    public record MetodoPagoRespuesta(
            Integer id,
            String nombre
    ) {}

    @GetMapping
    public Page<MetodoPagoRespuesta> listar(
            @RequestParam(defaultValue = "0") int page
    ) {
        if (page < 0) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "La página no puede ser negativa"
            );
        }

        return repository.findAll(
                PageRequest.of(page, 10, Sort.by("id").ascending())
        ).map(m -> new MetodoPagoRespuesta(
                m.getId(),
                m.getNombre()
        ));
    }
}