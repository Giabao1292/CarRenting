package com.example.car_rental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
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
    private LocalDateTime createdAt;

    @NotNull
    @ColumnDefault("sysutcdatetime()")
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "vehicle")
    private Set<AvailabilitySlot> availabilitySlots = new LinkedHashSet<>();

    @OneToMany(mappedBy = "vehicle")
    private Set<BookingItem> bookingItems = new LinkedHashSet<>();

    @OneToMany(mappedBy = "vehicle")
    @BatchSize(size = 20)
    private Set<Review> reviews = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "vehicle_feature_map",
            joinColumns = @JoinColumn(name = "vehicle_id"),
            inverseJoinColumns = @JoinColumn(name = "feature_id")
    )
    private Set<VehicleFeature> vehicleFeatures = new LinkedHashSet<>();

    @Column(name = "price_per_day", precision = 12, scale = 2)
    private BigDecimal pricePerDay;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'automatic'")
    @Column(name = "transmission", nullable = false, length = 20)
    private String transmission;

    @OneToMany(mappedBy = "vehicle")
    @BatchSize(size = 20)
    private Set<VehicleImage> vehicleImages = new LinkedHashSet<>();

    @NotNull
    @ColumnDefault("0.0")
    @Column(name = "avg_rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal avgRating;

}