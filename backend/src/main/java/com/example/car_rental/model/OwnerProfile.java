package com.example.car_rental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "owner_profiles")
public class OwnerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ColumnDefault("'07:00:00'")
    @Column(name = "open_time", nullable = false)
    private LocalTime openTime;

    @NotNull
    @ColumnDefault("'20:00:00'")
    @Column(name = "close_time", nullable = false)
    private LocalTime closeTime;

    @NotNull
    @ColumnDefault("sysutcdatetime()")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @NotNull
    @ColumnDefault("sysutcdatetime()")
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Size(max = 20)
    @NotNull
    @Nationalized
    @ColumnDefault("N'INDIVIDUAL'")
    @Column(name = "owner_type", nullable = false, length = 20)
    private String ownerType;

    @Size(max = 20)
    @NotNull
    @Nationalized
    @ColumnDefault("N'PERMANENT'")
    @Column(name = "residency_type", nullable = false, length = 20)
    private String residencyType;

    @Size(max = 150)
    @NotNull
    @Nationalized
    @ColumnDefault("N''")
    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Size(max = 120)
    @NotNull
    @Nationalized
    @ColumnDefault("N''")
    @Column(name = "city", nullable = false, length = 120)
    private String city;

    @Size(max = 255)
    @Nationalized
    @Column(name = "address")
    private String address;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("''")
    @Column(name = "id_number", nullable = false, length = 20)
    private String idNumber;

    @Size(max = 500)
    @Nationalized
    @Column(name = "id_card_front_url", length = 500)
    private String idCardFrontUrl;

    @Size(max = 500)
    @Nationalized
    @Column(name = "id_card_back_url", length = 500)
    private String idCardBackUrl;

    @Size(max = 20)
    @NotNull
    @Nationalized
    @ColumnDefault("N'PENDING'")
    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus;

    @Size(max = 500)
    @Nationalized
    @Column(name = "review_note", length = 500)
    private String reviewNote;

}