package com.example.car_rental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "vehicle_types")
public class VehicleType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotNull
    @ColumnDefault("4")
    @Column(name = "seating", nullable = false)
    private Integer seating;

    @NotNull
    @ColumnDefault("1")
    @Column(name = "luggage", nullable = false)
    private Integer luggage;

    @OneToMany(mappedBy = "type")
    private Set<Vehicle> vehicles = new LinkedHashSet<>();

}