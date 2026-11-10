package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.MantenimientoEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.time.LocalDate;
import java.util.List;

public interface MantenimientoEquipoRepository
        extends JpaRepository<MantenimientoEquipo, Long>, JpaSpecificationExecutor<MantenimientoEquipo> {
    boolean existsByEquipoIdAndFechaProgramada(Long equipoId, LocalDate fecha);

    List<MantenimientoEquipo> findByEquipoIdAndFechaProgramadaBetween(Long id, LocalDate inicio, LocalDate fin);
}
