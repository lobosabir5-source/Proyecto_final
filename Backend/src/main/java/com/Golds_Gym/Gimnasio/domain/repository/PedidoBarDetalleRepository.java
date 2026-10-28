package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.PedidoBarDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoBarDetalleRepository extends JpaRepository<PedidoBarDetalle, Integer> {
    List<PedidoBarDetalle> findByPedidoIdOrderByIdAsc(Integer pedidoId);
}
