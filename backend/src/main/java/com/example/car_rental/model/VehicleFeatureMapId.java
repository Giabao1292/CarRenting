package com.example.car_rental.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.Objects;

@Getter
@Setter
@Embeddable
public class VehicleFeatureMapId implements java.io.Serializable {
    private static final long serialVersionUID = 1189111124114628280L;
    @NotNull
    @Column(name = "vehicle_id", nullable = false)
    private Integer vehicleId;

    @NotNull
    @Column(name = "feature_id", nullable = false)
    private Integer featureId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        VehicleFeatureMapId entity = (VehicleFeatureMapId) o;
        return Objects.equals(this.vehicleId, entity.vehicleId) &&
                Objects.equals(this.featureId, entity.featureId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(vehicleId, featureId);
    }

}