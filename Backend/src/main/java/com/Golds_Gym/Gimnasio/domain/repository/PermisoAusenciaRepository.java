package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.PermisoAusencia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PermisoAusenciaRepository extends JpaRepository<PermisoAusencia, Integer> {
    Page<PermisoAusencia> findByMembresia_Cliente_Usuario_IdOrderBySolicitadoEnDesc(
            Long usuarioId,
            Pageable pageable);
    Page<PermisoAusencia> findAllByOrderBySolicitadoEnDesc(
            Pageable pageable);
    List<PermisoAusencia> findByMembresia_Cliente_Id(
            Long clienteId);
    List<PermisoAusencia> findByMembresia_Id(
            Long membresiaId);
}
