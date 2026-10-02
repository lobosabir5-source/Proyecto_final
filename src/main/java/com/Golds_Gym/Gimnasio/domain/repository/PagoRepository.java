package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.Pago;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findAllByMembresia_IdOrderByFechaPagoDesc(Long membresiaId);

    Page<Pago> findAllByMembresia_Cliente_Usuario_IdOrderByFechaPagoDesc(Long usuarioId, Pageable pageable);

    @Query("select coalesce(sum(pago.monto), 0) from Pago pago where pago.membresia.id = :membresiaId")
    BigDecimal totalPorMembresia(@Param("membresiaId") Long membresiaId);

    @Query("select coalesce(sum(pago.monto), 0) from Pago pago where pago.fechaPago >= :desde and pago.fechaPago < :hasta")
    BigDecimal totalEntre(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}