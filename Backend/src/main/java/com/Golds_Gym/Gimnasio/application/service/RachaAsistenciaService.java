package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.RachaAsistenciaRespuesta;
import com.Golds_Gym.Gimnasio.domain.model.Asistencia;
import com.Golds_Gym.Gimnasio.domain.repository.AsistenciaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
public class RachaAsistenciaService {
    private final AsistenciaRepository asistencias;

    public RachaAsistenciaService(AsistenciaRepository asistencias) {
        this.asistencias = asistencias;
    }

    @Transactional(readOnly = true)
    public RachaAsistenciaRespuesta obtener(Long usuarioId) {
        LocalDate hoy = LocalDate.now();
        int racha = 0;
        LocalDate ultima = null;
        LocalDate esperado = null;
        boolean asistioHoy = false;
        int pagina = 0;
        while (true) {
            Page<Asistencia> lote = asistencias
                    .findByCliente_Usuario_IdAndFechaLessThanEqualOrderByFechaDesc(
                            usuarioId, hoy, PageRequest.of(pagina, 10));
            if (lote.isEmpty()) break;
            for (Asistencia asistencia : lote.getContent()) {
                LocalDate fecha = asistencia.getFecha();
                if (ultima == null) {
                    ultima = fecha;
                    asistioHoy = fecha.equals(hoy);
                    if (!asistioHoy && !fecha.equals(hoy.minusDays(1))) {
                        return new RachaAsistenciaRespuesta(0, false, ultima, hoy);
                    }
                    esperado = fecha;
                }
                if (!fecha.equals(esperado)) {
                    return new RachaAsistenciaRespuesta(racha, asistioHoy, ultima,
                            asistioHoy ? hoy.plusDays(1) : hoy);
                }
                racha++;
                esperado = esperado.minusDays(1);
            }
            if (!lote.hasNext()) break;
            pagina++;
        }
        return new RachaAsistenciaRespuesta(racha, asistioHoy, ultima,
                asistioHoy ? hoy.plusDays(1) : hoy);
    }
}
