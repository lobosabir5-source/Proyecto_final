package com.Golds_Gym.Gimnasio.application.service;

import com.Golds_Gym.Gimnasio.application.dto.PermisoAusenciaRespuesta;
import com.Golds_Gym.Gimnasio.domain.repository.PermisoAusenciaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PermisoAusenciaService {
    private final PermisoAusenciaRepository permisos;

    public PermisoAusenciaService(PermisoAusenciaRepository permisos) {
        this.permisos = permisos;
    }

    @Transactional(readOnly = true)
    public List<PermisoAusenciaRespuesta> listarDeUsuario(Long usuarioId) {
        return permisos.findByMembresia_Cliente_Usuario_IdOrderBySolicitadoEnDesc(usuarioId).stream()
                .map(permiso -> new PermisoAusenciaRespuesta(
                        permiso.getId(),
                        permiso.getMembresia().getId(),
                        permiso.getMotivo(),
                        permiso.getDiasAgregados(),
                        permiso.getSolicitadoEn()))
                .toList();
    }
}
