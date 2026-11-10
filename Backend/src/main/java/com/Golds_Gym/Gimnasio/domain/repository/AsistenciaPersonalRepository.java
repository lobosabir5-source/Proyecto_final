package com.Golds_Gym.Gimnasio.domain.repository;
import com.Golds_Gym.Gimnasio.domain.model.AsistenciaPersonal;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;
import java.time.LocalDate;
public interface AsistenciaPersonalRepository extends JpaRepository<AsistenciaPersonal,Long> {
 boolean existsByPersonalIdAndFechaAndTurno(Long personalId,LocalDate fecha,AsistenciaPersonal.Turno turno);
 boolean existsByPersonalIdAndFechaAndTurnoAndIdNot(Long personalId,LocalDate fecha,AsistenciaPersonal.Turno turno,Long id);
 @Query("select a from AsistenciaPersonal a join a.personal p where (:personalId is null or p.id=:personalId) and (:desde is null or a.fecha>=:desde) and (:hasta is null or a.fecha<=:hasta) and (:turno is null or a.turno=:turno) and (:estado is null or a.estado=:estado)")
 Page<AsistenciaPersonal> buscar(@Param("personalId") Long personalId,@Param("desde") LocalDate desde,@Param("hasta") LocalDate hasta,@Param("turno") AsistenciaPersonal.Turno turno,@Param("estado") AsistenciaPersonal.Estado estado,Pageable pageable);
}
