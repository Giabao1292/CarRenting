CREATE TABLE tokens (
                        id BIGINT IDENTITY(1,1) PRIMARY KEY,
                        token VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        expiry_date DATETIME NOT NULL
);