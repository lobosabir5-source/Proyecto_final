package com.Golds_Gym.Gimnasio.domain.repository;
import com.Golds_Gym.Gimnasio.domain.model.InscripcionAerobica;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface InscripcionAerobicaRepository extends JpaRepository<InscripcionAerobica,Long> {
 long countByClaseIdAndEstado(Long claseId,InscripcionAerobica.Estado estado);
 Optional<InscripcionAerobica> findByClaseIdAndClienteId(Long claseId,Long clienteId);
 Page<InscripcionAerobica> findByClaseId(Long claseId,Pageable pageable);
 List<InscripcionAerobica> findByClaseIdAndLlegadaClienteIsNotNullOrderByLlegadaClienteAscIdAsc(Long claseId);
}
