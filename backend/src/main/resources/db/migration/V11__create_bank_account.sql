CREATE TABLE car_rental.dbo.bank_accounts
(
    id                  INT PRIMARY KEY                      NOT NULL,
    owner_user_id       INT                                  NOT NULL,
    bank_name           NVARCHAR(100) NOT NULL,                        -- Tên ngân hàng (Vietcombank, BIDV, Techcombank...)
    account_number      VARCHAR(50)                          NOT NULL, -- Số tài khoản ngân hàng
    account_holder_name NVARCHAR(200) NOT NULL,                        -- Tên chủ tài khoản
    is_primary          BIT       DEFAULT (0)                NOT NULL, -- Tài khoản mặc định
    is_verified         BIT       DEFAULT (0)                NOT NULL, -- Đã xác minh chưa
    created_at          DATETIME2 DEFAULT (SYSUTCDATETIME()) NOT NULL,
    updated_at          DATETIME2 DEFAULT (SYSUTCDATETIME()) NOT NULL,
    CONSTRAINT FK_bank_accounts_owner
        FOREIGN KEY (owner_user_id) REFERENCES users (id),

    CONSTRAINT UQ_bank_accounts_account_number
        UNIQUE (account_number)
);
GO

ALTER TABLE car_rental.dbo.vehicles
    ADD rejection_reason NVARCHAR(500) NULL;
GO