package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.ReporteResumenRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.EstadoMembresia;
import com.Golds_Gym.Gimnasio.domain.repository.AsistenciaRepository;
import com.Golds_Gym.Gimnasio.domain.repository.ClienteRepository;
import com.Golds_Gym.Gimnasio.domain.repository.MembresiaRepository;
import com.Golds_Gym.Gimnasio.domain.repository.PagoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class ReporteService {

    private final ClienteRepository clienteRepository;
    private final MembresiaRepository membresiaRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final PagoRepository pagoRepository;

    public ReporteService(
            ClienteRepository clienteRepository,
            MembresiaRepository membresiaRepository,
            AsistenciaRepository asistenciaRepository,
            PagoRepository pagoRepository) {
        this.clienteRepository = clienteRepository;
        this.membresiaRepository = membresiaRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.pagoRepository = pagoRepository;
    }

    @Transactional(readOnly = true)
    public ReporteResumenRespuesta resumen() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioMes = hoy.withDayOfMonth(1).atStartOfDay();
        LocalDateTime inicioMesSiguiente = hoy.withDayOfMonth(1).plusMonths(1).atStartOfDay();
        BigDecimal ingresosMes = pagoRepository.totalEntre(inicioMes, inicioMesSiguiente);
        return new ReporteResumenRespuesta(
                clienteRepository.countByUsuario_ActivoTrue(),
                membresiaRepository.countByEstadoAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                    EstadoMembresia.ACTIVA, hoy, hoy),
                membresiaRepository.countByEstadoAndFechaFinGreaterThanEqual(EstadoMembresia.PENDIENTE, hoy),
                asistenciaRepository.countByFecha(hoy),
                ingresosMes);
    }
}