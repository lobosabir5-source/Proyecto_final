package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface PromocionRepository extends JpaRepository<Promocion, Long> {
    List<Promocion> findByActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(LocalDate desde,
            LocalDate hasta);
}
