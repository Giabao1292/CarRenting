package com.example.car_rental.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Table(name = "flyway_schema_history")
public class FlywaySchemaHistory {
    @Id
    @Column(name = "installed_rank", nullable = false)
    private Integer id;

    @Size(max = 50)
    @Nationalized
    @Column(name = "version", length = 50)
    private String version;

    @Size(max = 200)
    @Nationalized
    @Column(name = "description", length = 200)
    private String description;

    @Size(max = 20)
    @NotNull
    @Nationalized
    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Size(max = 1000)
    @NotNull
    @Nationalized
    @Column(name = "script", nullable = false, length = 1000)
    private String script;

    @Column(name = "checksum")
    private Integer checksum;

    @Size(max = 100)
    @NotNull
    @Nationalized
    @Column(name = "installed_by", nullable = false, length = 100)
    private String installedBy;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "installed_on", nullable = false)
    private Instant installedOn;

    @NotNull
    @Column(name = "execution_time", nullable = false)
    private Integer executionTime;

    @NotNull
    @Column(name = "success", nullable = false)
    private Boolean success = false;

}