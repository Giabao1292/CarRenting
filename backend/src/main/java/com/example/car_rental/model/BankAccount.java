package com.example.car_rental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "bank_accounts")
public class BankAccount {
    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User ownerUser;

    @Size(max = 100)
    @NotNull
    @Nationalized
    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Size(max = 50)
    @NotNull
    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Size(max = 200)
    @NotNull
    @Nationalized
    @Column(name = "account_holder_name", nullable = false, length = 200)
    private String accountHolderName;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @NotNull
    @ColumnDefault("sysutcdatetime()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("sysutcdatetime()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

}