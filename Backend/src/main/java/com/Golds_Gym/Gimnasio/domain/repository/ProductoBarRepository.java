
package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.ProductoBar;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductoBarRepository
        extends JpaRepository<ProductoBar, Integer>,
        JpaSpecificationExecutor<ProductoBar> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(
            String nombre,
            Integer id
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductoBar p WHERE p.id = :id")
    Optional<ProductoBar> bloquearPorId(
            @Param("id") Integer id
    );
}
