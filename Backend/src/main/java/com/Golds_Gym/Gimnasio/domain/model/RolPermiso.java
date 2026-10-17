package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "roles_permisos")
public class RolPermiso {
    @EmbeddedId
    private RolPermisoId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("rolId")
    @JoinColumn(name = "idroles", nullable = false)
    private RolEntidad rol;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("permisoId")
    @JoinColumn(name = "idpermisos", nullable = false)
    private Permiso permiso;
}
