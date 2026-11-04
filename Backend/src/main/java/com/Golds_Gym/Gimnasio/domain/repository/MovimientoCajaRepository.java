package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.MovimientoCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.*;
import java.util.*;

public interface MovimientoCajaRepository extends JpaRepository<MovimientoCaja, Long> {
    List<MovimientoCaja> findByCaja_Id(Long cajaId);

    Page<MovimientoCaja> findByCaja_IdOrderByIdDesc(Long cajaId, Pageable pageable);

    boolean existsByOrigenTipoAndOrigenId(String tipo, Long id);
}
