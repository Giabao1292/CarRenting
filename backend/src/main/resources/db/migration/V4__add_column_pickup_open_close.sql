CREATE TABLE owner_profiles (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT NOT NULL UNIQUE,
    open_time   TIME NOT NULL CONSTRAINT DF_owner_profiles_open_time  DEFAULT '07:00:00',
    close_time  TIME NOT NULL CONSTRAINT DF_owner_profiles_close_time DEFAULT '20:00:00',
    created_at  DATETIME2 NOT NULL CONSTRAINT DF_owner_profiles_created_at DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2 NOT NULL CONSTRAINT DF_owner_profiles_updated_at DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_owner_profiles_user    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT CK_owner_profiles_time    CHECK (open_time < close_time)
);