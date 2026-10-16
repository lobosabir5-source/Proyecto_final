package com.Golds_Gym.Gimnasio.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class RolPermisoId implements Serializable {
    @Column(name = "idroles")
    private Integer rolId;
    @Column(name = "idpermisos")
    private Integer permisoId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RolPermisoId that)) return false;
        return Objects.equals(rolId, that.rolId) && Objects.equals(permisoId, that.permisoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(rolId, permisoId);
    }
}
