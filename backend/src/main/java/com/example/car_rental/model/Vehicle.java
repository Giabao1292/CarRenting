package com.example.car_rental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "default_location_id")
    private Location defaultLocation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "type_id", nullable = false)
    private VehicleType type;

    @Size(max = 50)
    @NotNull
    @Column(name = "license_plate", nullable = false, length = 50)
    private String licensePlate;

    @Size(max = 100)
    @Column(name = "brand", length = 100)
    private String brand;

    @Size(max = 100)
    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "\"year\"")
    private Integer year;

    @Size(max = 50)
    @Column(name = "color", length = 50)
    private String color;

    @Size(max = 30)
    @NotNull
    @ColumnDefault("'available'")
    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "owner_user_id")
    private User ownerUser;

    @NotNull
    @ColumnDefault("sysutcdatetime()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("sysutcdatetime()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "vehicle")
    private Set<AvailabilitySlot> availabilitySlots = new LinkedHashSet<>();

    @OneToMany(mappedBy = "vehicle")
    private Set<BookingItem> bookingItems = new LinkedHashSet<>();

    @OneToMany(mappedBy = "vehicle")
    private Set<Review> reviews = new LinkedHashSet<>();

    @ManyToMany
    private Set<VehicleFeature> vehicleFeatures = new LinkedHashSet<>();

}