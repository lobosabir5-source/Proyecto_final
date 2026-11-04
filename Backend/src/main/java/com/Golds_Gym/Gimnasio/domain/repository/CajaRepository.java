package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.Caja;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.*;
import java.util.*;

public interface CajaRepository extends JpaRepository<Caja, Long> {
    Optional<Caja> findFirstByEstadoOrderByIdDesc(String estado);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Caja c where c.id=:id")
    Optional<Caja> bloquear(Long id);

    Page<Caja> findAllByOrderByIdDesc(Pageable pageable);
}
