package com.Golds_Gym.Gimnasio.domain.repository;

import com.Golds_Gym.Gimnasio.domain.model.Personal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PersonalRepository extends JpaRepository<Personal, Long> {
       boolean existsByDocumento(String documento);

       boolean existsByDocumentoAndIdNot(String documento, Long id);

       @Query("select p from Personal p where " +
                     "(:texto is null or lower(p.nombres) like lower(concat('%', :texto, '%')) " +
                     "or lower(p.apellidos) like lower(concat('%', :texto, '%')) " +
                     "or lower(p.documento) like lower(concat('%', :texto, '%'))) " +
                     "and (:cargo is null or p.cargo = :cargo) " +
                     "and (:estado is null or p.estadoLaboral = :estado)")
       Page<Personal> buscar(@Param("texto") String texto,
                     @Param("cargo") Personal.Cargo cargo,
                     @Param("estado") Personal.EstadoLaboral estado, Pageable pageable);
}
