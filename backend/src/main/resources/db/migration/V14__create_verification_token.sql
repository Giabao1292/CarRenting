CREATE TABLE verification_tokens
(
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    token       NVARCHAR(255) NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL,
    expiry_date DATETIME2 NOT NULL,
    used        BIT       NOT NULL DEFAULT 0
);
ALTER TABLE users
ALTER COLUMN full_name NVARCHAR(255);