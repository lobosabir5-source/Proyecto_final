package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.PermisoAusencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PermisoAusenciaRepository extends JpaRepository<PermisoAusencia, Integer> {
    List<PermisoAusencia> findByMembresia_Cliente_Usuario_IdOrderBySolicitadoEnDesc(Long usuarioId);
}
