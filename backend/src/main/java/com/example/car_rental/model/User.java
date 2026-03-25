package com.example.car_rental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User implements UserDetails{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "email", nullable = false)
    private String email;

    @Size(max = 255)
    @NotNull
    @Column(name = "password_hash", nullable = false)
    private String password;

    @Size(max = 200)
    @NotNull
    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Size(max = 30)
    @Column(name = "phone", length = 30)
    private String phone;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'customer'")
    @Column(name = "role", nullable = false, length = 20)
    private String role;

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
    @Column(name = "verified", nullable = false)
    private Boolean verified = false;

    @Column(name = "dob")
    private LocalDate dob;

    @Nationalized
    @Lob
    @Column(name = "address_text")
    private String addressText;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "user")
    private Set<Booking> bookings = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Document> documents = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Payment> payments = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Review> reviews = new LinkedHashSet<>();

    @OneToMany(mappedBy = "ownerUser")
    private Set<Vehicle> vehicles = new LinkedHashSet<>();

    @Size(max = 255)
    @Column(name = "avatar")
    private String avatar;

    @OneToOne(mappedBy = "user")
    private OwnerProfile ownerProfile;

    @OneToMany(mappedBy = "ownerUser")
    private Set<BankAccount> bankAccounts = new LinkedHashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Set.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return !isDeleted;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isDeleted;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return !isDeleted;
    }

    @Override
    public boolean isEnabled() {
        return verified;
    }
}