package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.ItemInventario;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface ItemInventarioRepository
        extends JpaRepository<ItemInventario, Long>, JpaSpecificationExecutor<ItemInventario> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from ItemInventario i where i.id=:id")
    Optional<ItemInventario> bloquear(@Param("id") Long id);
}