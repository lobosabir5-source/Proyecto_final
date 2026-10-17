package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.*;
import com.Golds_Gym.Gimnasio.domain.model.EstadoMembresia;
import com.Golds_Gym.Gimnasio.domain.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.BiFunction;

@Service
public class ReporteService {
    private static final int MESES_GRAFICO = 6;
    private static final Set<EstadoMembresia> VIGENTES = EnumSet.of(EstadoMembresia.ACTIVA, EstadoMembresia.POR_VENCER);
    private static final DateTimeFormatter ETIQUETA_MES = DateTimeFormatter.ofPattern("MMM yy", Locale.forLanguageTag("es"));

    private final ClienteRepository clienteRepository;
    private final MembresiaRepository membresiaRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final PagoRepository pagoRepository;
    private final HistorialMembresiaRepository historialRepository;
    private final MembresiaService membresiaService;
    private final ClienteService clienteService;
    private final PagoService pagoService;

    public ReporteService(ClienteRepository clienteRepository, MembresiaRepository membresiaRepository,
            AsistenciaRepository asistenciaRepository, PagoRepository pagoRepository,
            HistorialMembresiaRepository historialRepository, MembresiaService membresiaService,
            ClienteService clienteService, PagoService pagoService) {
        this.clienteRepository = clienteRepository;
        this.membresiaRepository = membresiaRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.pagoRepository = pagoRepository;
        this.historialRepository = historialRepository;
        this.membresiaService = membresiaService;
        this.clienteService = clienteService;
        this.pagoService = pagoService;
    }

    @Transactional(readOnly = true)
    public ReporteResumenRespuesta resumen() {
        LocalDate hoy = LocalDate.now();
        long porVencer = contarPorVencer(hoy);
        long vigentes = membresiaRepository
                .countByEstadoInAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(VIGENTES, hoy, hoy);
        long vencidas = membresiaRepository.countByEstado(EstadoMembresia.VENCIDA)
                + membresiaRepository.countByEstadoInAndFechaFinLessThan(VIGENTES, hoy);
        return new ReporteResumenRespuesta(
                clienteRepository.countByUsuario_ActivoTrue(),
                Math.max(0, vigentes - porVencer),
                membresiaRepository.countByEstadoAndFechaFinGreaterThanEqual(EstadoMembresia.PENDIENTE, hoy),
                porVencer, vencidas,
                asistenciaRepository.countByFecha(hoy),
                ingresosDelMes(hoy),
                serie(hoy, (d, h) -> BigDecimal.valueOf(clienteRepository.countByFechaAltaBetween(d, h.minusDays(1)))),
                serie(hoy, (d, h) -> pagoRepository.totalEntre(d.atStartOfDay(), h.atStartOfDay())),
                serie(hoy, (d, h) -> BigDecimal.valueOf(historialRepository
                        .countByOperacionAndFechaOperacionBetween("RENOVACION", d.atStartOfDay(), h.atStartOfDay()))));
    }

    @Transactional
    public ResumenRecepcionRespuesta resumenRecepcion() {
        LocalDate hoy = LocalDate.now();
        return new ResumenRecepcionRespuesta(
                clienteRepository.countByUsuario_ActivoTrue(),
                asistenciaRepository.countByFecha(hoy),
                contarPorVencer(hoy), ingresosDelMes(hoy),
                membresiaService.proximasAVencer(), clienteService.recientes(), pagoService.recientes());
    }

    private long contarPorVencer(LocalDate hoy) {
        return membresiaRepository.countByEstadoInAndFechaInicioLessThanEqualAndFechaFinBetween(
                VIGENTES, hoy, hoy, hoy.plusDays(MembresiaService.DIAS_POR_VENCER));
    }

    private BigDecimal ingresosDelMes(LocalDate hoy) {
        LocalDate inicio = hoy.withDayOfMonth(1);
        return pagoRepository.totalEntre(inicio.atStartOfDay(), inicio.plusMonths(1).atStartOfDay());
    }

    private List<PuntoMensualRespuesta> serie(LocalDate hoy, BiFunction<LocalDate, LocalDate, BigDecimal> valor) {
        List<PuntoMensualRespuesta> puntos = new ArrayList<>();
        for (int i = MESES_GRAFICO - 1; i >= 0; i--) {
            LocalDate desde = hoy.withDayOfMonth(1).minusMonths(i);
            puntos.add(new PuntoMensualRespuesta(desde.format(ETIQUETA_MES), valor.apply(desde, desde.plusMonths(1))));
        }
        return puntos;
    }
}