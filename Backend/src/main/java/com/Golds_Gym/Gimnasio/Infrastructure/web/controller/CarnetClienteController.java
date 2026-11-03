package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;
import com.Golds_Gym.Gimnasio.application.dto.CarnetClienteRespuesta;
import com.Golds_Gym.Gimnasio.application.service.RachaAsistenciaService;
import com.Golds_Gym.Gimnasio.domain.model.*;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/cliente/carnet")
public class CarnetClienteController {
    private final RachaAsistenciaService rachas;
    private final MembresiaRepository membresias;
    private final PermisoAusenciaRepository permisos;
    public CarnetClienteController(MembresiaRepository membresias, PermisoAusenciaRepository permisos, RachaAsistenciaService rachas) {
        this.membresias = membresias; this.permisos = permisos; this.rachas = rachas;
    }
    @GetMapping
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public CarnetClienteRespuesta obtener(Authentication auth) {
        Long usuarioId = ((Usuario) auth.getPrincipal()).getId();
        Membresia m = membresias.findAllByCliente_Usuario_IdOrderByFechaInicioDesc(usuarioId,
            org.springframework.data.domain.PageRequest.of(0, 10)).stream().findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sin membresía"));
        LocalDate hoy = LocalDate.now();
        int usados = 0;
        for (PermisoAusencia p : permisos.findByMembresia_Cliente_Id(m.getCliente().getId())) {
            if (p.getEstado() != EstadoPermiso.APROBADO || p.getFechaInicio() == null || p.getFechaFin() == null) continue;
            for (LocalDate d = p.getFechaInicio(); !d.isAfter(p.getFechaFin()); d = d.plusDays(1))
                if (d.getMonth() == hoy.getMonth() && d.getYear() == hoy.getYear()) usados++;
        }
        usados = Math.min(3, usados);
        boolean mesCubierto = !hoy.withDayOfMonth(1).isAfter(m.getFechaFin())
            && !hoy.withDayOfMonth(hoy.lengthOfMonth()).isBefore(m.getFechaInicio());
        int disponibles = mesCubierto ? 3 - usados : 0;
        return new CarnetClienteRespuesta(m.getCliente().getId(), m.getCliente().getNombre(),
            m.getCliente().getNumeroDocumento(), m.getCliente().getFotoUrl(), m.getId(),
            m.getPlan().getNombre(), m.getEstado().name(), m.getFechaInicio(), m.getFechaFin(),
            usados, disponibles, List.of(usados >= 1, usados >= 2, usados >= 3), rachas.obtener(usuarioId));
    }
}
