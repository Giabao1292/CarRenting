-- ============================================================
-- V1__init_schema.sql
-- Initial database schema
-- ============================================================

CREATE TABLE users (
                       id INT IDENTITY(1,1) PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(200) NOT NULL,
                       phone VARCHAR(30),
                       role VARCHAR(20) NOT NULL DEFAULT 'customer',
                       created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                       updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                       verified BIT NOT NULL DEFAULT 0,
                       dob DATE,
                       address_text NVARCHAR(MAX),
                       is_deleted BIT NOT NULL DEFAULT 0
);

-- LOCATIONS
CREATE TABLE locations (
                           id INT IDENTITY(1,1) PRIMARY KEY,
                           name VARCHAR(200) NOT NULL,
                           address NVARCHAR(MAX),
                           city VARCHAR(100),
                           country VARCHAR(100),
                           lat FLOAT,
                           lng FLOAT,
                           created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                           updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- VEHICLE TYPES
CREATE TABLE vehicle_types (
                               id INT IDENTITY(1,1) PRIMARY KEY,
                               name VARCHAR(100) NOT NULL,
                               seating INT NOT NULL DEFAULT 4,
                               luggage INT NOT NULL DEFAULT 1
);

-- VEHICLES
CREATE TABLE vehicles (
                          id INT IDENTITY(1,1) PRIMARY KEY,
                          default_location_id INT NULL,
                          type_id INT NOT NULL,
                          license_plate VARCHAR(50) NOT NULL UNIQUE,
                          brand VARCHAR(100),
                          model VARCHAR(100),
                          year INT,
                          color VARCHAR(50),
                          status VARCHAR(30) NOT NULL DEFAULT 'available',
                          owner_user_id INT NULL,
                          created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                          updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                          is_deleted BIT NOT NULL DEFAULT 0,

                          CONSTRAINT FK_vehicle_location
                              FOREIGN KEY (default_location_id) REFERENCES locations(id) ON DELETE SET NULL,

                          CONSTRAINT FK_vehicle_type
                              FOREIGN KEY (type_id) REFERENCES vehicle_types(id) ON DELETE NO ACTION, -- ← RESTRICT → NO ACTION

                          CONSTRAINT FK_vehicle_owner
                              FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- VEHICLE FEATURES
CREATE TABLE vehicle_features (
                                  id INT IDENTITY(1,1) PRIMARY KEY,
                                  name VARCHAR(100) NOT NULL UNIQUE
);

-- VEHICLE FEATURE MAP
CREATE TABLE vehicle_feature_map (
                                     vehicle_id INT NOT NULL,
                                     feature_id INT NOT NULL,
                                     PRIMARY KEY (vehicle_id, feature_id),

                                     CONSTRAINT FK_vfm_vehicle
                                         FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,

                                     CONSTRAINT FK_vfm_feature
                                         FOREIGN KEY (feature_id) REFERENCES vehicle_features(id) ON DELETE NO ACTION
);

-- BOOKINGS
CREATE TABLE bookings (
                          id INT IDENTITY(1,1) PRIMARY KEY,
                          booking_code VARCHAR(50) NOT NULL UNIQUE,
                          user_id INT NOT NULL,
                          status VARCHAR(30) NOT NULL DEFAULT 'pending',  -- pending, active, completed, cancelled
                          pickup_location_id INT NOT NULL,
                          dropoff_location_id INT NOT NULL,
                          pickup_at DATETIME2 NOT NULL,
                          dropoff_at DATETIME2 NOT NULL,
                          total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
                          currency VARCHAR(10) NOT NULL DEFAULT 'VND',
                          created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                          updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

                          CONSTRAINT FK_booking_user
                              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,

                          CONSTRAINT FK_booking_pickup_location
                              FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE NO ACTION,

                          CONSTRAINT FK_booking_dropoff_location
                              FOREIGN KEY (dropoff_location_id) REFERENCES locations(id) ON DELETE NO ACTION,

                          CONSTRAINT CHK_booking_dates CHECK (pickup_at < dropoff_at)
);

-- BOOKING ITEMS
CREATE TABLE booking_items (
                               id INT IDENTITY(1,1) PRIMARY KEY,
                               booking_id INT NOT NULL,
                               vehicle_id INT NOT NULL,
                               price_per_unit DECIMAL(12,2) NOT NULL CHECK (price_per_unit >= 0),
                               quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
                               unit VARCHAR(20) NOT NULL DEFAULT 'day',
                               start_at DATETIME2 NULL,
                               end_at DATETIME2 NULL,
                               subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),

                               CONSTRAINT FK_booking_items_booking
                                   FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,

                               CONSTRAINT FK_booking_items_vehicle
                                   FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION
);

-- PAYMENTS
CREATE TABLE payments (
                          id INT IDENTITY(1,1) PRIMARY KEY,
                          booking_id INT NULL,
                          user_id INT NOT NULL,
                          amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
                          currency VARCHAR(10) NOT NULL DEFAULT 'VND',
                          provider VARCHAR(50),
                          provider_txn_id VARCHAR(200),
                          status VARCHAR(30) NOT NULL DEFAULT 'pending',
                          created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                          updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

                          CONSTRAINT FK_payment_booking
                              FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,

                          CONSTRAINT FK_payment_user
                              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
);

-- REFUNDS
CREATE TABLE refunds (
                         id INT IDENTITY(1,1) PRIMARY KEY,
                         payment_id INT NOT NULL,
                         amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
                         reason NVARCHAR(MAX),
                         status VARCHAR(30) NOT NULL DEFAULT 'requested',
                         provider_refund_id VARCHAR(100),
                         created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                         processed_at DATETIME2 NULL,

                         CONSTRAINT FK_refund_payment
                             FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- PROMOTIONS
CREATE TABLE promotions (
                            id INT IDENTITY(1,1) PRIMARY KEY,
                            code VARCHAR(50) NOT NULL UNIQUE,
                            discount_type VARCHAR(20) NOT NULL,
                            discount_value DECIMAL(12,2) NOT NULL CHECK (discount_value >= 0),
                            start_at DATETIME2 NULL,
                            end_at DATETIME2 NULL,
                            usage_limit INT NULL,
                            min_order_amount DECIMAL(12,2) NULL,
                            created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- BOOKING PROMOTIONS
CREATE TABLE booking_promotions (
                                    booking_id INT NOT NULL,
                                    promotion_id INT NOT NULL,
                                    discount_amount DECIMAL(12,2) NOT NULL,
                                    PRIMARY KEY (booking_id, promotion_id),
                                    CONSTRAINT FK_bp_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                                    CONSTRAINT FK_bp_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE NO ACTION
);

-- REVIEWS
CREATE TABLE reviews (
                         id INT IDENTITY(1,1) PRIMARY KEY,
                         booking_id INT NULL,
                         user_id INT NOT NULL,
                         vehicle_id INT NOT NULL,
                         rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                         comment NVARCHAR(MAX),
                         created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

                         CONSTRAINT FK_review_booking
                             FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,

                         CONSTRAINT FK_review_user
                             FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,

                         CONSTRAINT FK_review_vehicle
                             FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE NO ACTION
);

-- DOCUMENTS
CREATE TABLE documents (
                           id INT IDENTITY(1,1) PRIMARY KEY,
                           user_id INT NOT NULL,
                           doc_type VARCHAR(50),
                           doc_number VARCHAR(200),
                           file_url NVARCHAR(MAX),
                           verified BIT NOT NULL DEFAULT 0,
                           expiry_date DATE NULL,
                           created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

                           CONSTRAINT FK_documents_user
                               FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AVAILABILITY SLOTS
CREATE TABLE availability_slots (
                                    id INT IDENTITY(1,1) PRIMARY KEY,
                                    vehicle_id INT NOT NULL,
                                    start_at DATETIME2 NOT NULL,
                                    end_at DATETIME2 NOT NULL,
                                    status VARCHAR(30) NOT NULL DEFAULT 'blocked',
                                    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

                                    CONSTRAINT FK_availability_vehicle
                                        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,

                                    CONSTRAINT CHK_avail_dates CHECK (start_at < end_at)
);

-- INDEXES
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_pickup ON bookings(pickup_at);
CREATE INDEX idx_vehicles_type ON vehicles(type_id);
CREATE INDEX idx_availability_vehicle_period ON availability_slots(vehicle_id, start_at, end_at);