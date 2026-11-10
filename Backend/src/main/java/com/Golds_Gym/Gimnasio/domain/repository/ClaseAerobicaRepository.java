package com.Golds_Gym.Gimnasio.domain.repository;
import com.Golds_Gym.Gimnasio.domain.model.ClaseAerobica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.*;
import java.time.LocalDate;
public interface ClaseAerobicaRepository extends JpaRepository<ClaseAerobica,Long> {
 Page<ClaseAerobica> findByFecha(LocalDate fecha,Pageable pageable);
 boolean existsByInstructorIdAndFechaAndHoraInicioLessThanAndHoraFinGreaterThanAndEstadoNotAndIdNot(Long instructorId,LocalDate fecha,java.time.LocalTime fin,java.time.LocalTime inicio,ClaseAerobica.Estado estado,Long id);
}
