CREATE TABLE vehicle_images (
                                id          INT IDENTITY(1,1) PRIMARY KEY,
                                vehicle_id  INT NOT NULL,
                                image_url   VARCHAR(500) NOT NULL,
                                is_primary  BIT NOT NULL DEFAULT 0,  -- ảnh đại diện
                                created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

                                CONSTRAINT FK_vehicle_images_vehicle
                                    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);