/* =============================================
   V12__add_columns_owner_profile.sql
   Sửa lỗi duplicate key khi thêm UNIQUE cho id_number
   ============================================= */

USE car_rental;
GO

-- 1) Đảm bảo UNIQUE cho user_id
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UQ_owner_profiles_user_id'
      AND object_id = OBJECT_ID('dbo.owner_profiles')
)
BEGIN
ALTER TABLE dbo.owner_profiles
    ADD CONSTRAINT UQ_owner_profiles_user_id UNIQUE (user_id);
END
GO

-- 2) Thêm các cột Step 1
IF COL_LENGTH('dbo.owner_profiles', 'owner_type') IS NULL
BEGIN
ALTER TABLE dbo.owner_profiles ADD owner_type NVARCHAR(20) NOT NULL
        CONSTRAINT DF_owner_profiles_owner_type DEFAULT (N'INDIVIDUAL');
END
GO

IF COL_LENGTH('dbo.owner_profiles', 'residency_type') IS NULL
BEGIN
ALTER TABLE dbo.owner_profiles ADD residency_type NVARCHAR(20) NOT NULL
        CONSTRAINT DF_owner_profiles_residency_type DEFAULT (N'PERMANENT');
END
GO

IF COL_LENGTH('dbo.owner_profiles', 'full_name') IS NULL
BEGIN
ALTER TABLE dbo.owner_profiles ADD full_name NVARCHAR(150) NOT NULL
        CONSTRAINT DF_owner_profiles_full_name DEFAULT (N'');
END
GO

IF COL_LENGTH('dbo.owner_profiles', 'city') IS NULL
BEGIN
ALTER TABLE dbo.owner_profiles ADD city NVARCHAR(120) NOT NULL
        CONSTRAINT DF_owner_profiles_city DEFAULT (N'');
END
GO

IF COL_LENGTH('dbo.owner_profiles', 'address') IS NULL
BEGIN
ALTER TABLE dbo.owner_profiles ADD address NVARCHAR(255) NULL;
END
GO

IF COL_LENGTH('dbo.owner_profiles', 'id_number') IS NULL
BEGIN
ALTER TABLE dbo.owner_profiles ADD id_number VARCHAR(20) NOT NULL
    CONSTRAINT DF_owner_profiles_id_number DEFAULT ('');
END
GO

-- ==================== SỬA LỖI UNIQUE id_number ====================
-- Xóa các bản ghi có id_number rỗng (nếu bạn chấp nhận xóa)
-- Hoặc cập nhật chúng thành giá trị tạm (khuyến nghị)
UPDATE dbo.owner_profiles
SET id_number = 'TEMP_' + CAST(id AS VARCHAR(10))
WHERE id_number = '' OR id_number IS NULL;

-- Bây giờ mới thêm UNIQUE constraint
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UQ_owner_profiles_id_number'
      AND object_id = OBJECT_ID('dbo.owner_profiles')
)
BEGIN
ALTER TABLE dbo.owner_profiles
    ADD CONSTRAINT UQ_owner_profiles_id_number UNIQUE (id_number);
END
GO

-- 3) Step 2: Ảnh CCCD
IF COL_LENGTH('dbo.owner_profiles', 'id_card_front_url') IS NULL
ALTER TABLE dbo.owner_profiles ADD id_card_front_url NVARCHAR(500) NULL;
GO

IF COL_LENGTH('dbo.owner_profiles', 'id_card_back_url') IS NULL
ALTER TABLE dbo.owner_profiles ADD id_card_back_url NVARCHAR(500) NULL;
GO

-- 4) Trạng thái + review_note
IF COL_LENGTH('dbo.owner_profiles', 'verification_status') IS NULL
BEGIN
ALTER TABLE dbo.owner_profiles ADD verification_status NVARCHAR(20) NOT NULL
        CONSTRAINT DF_owner_profiles_verification_status DEFAULT (N'PENDING');
END
GO

IF COL_LENGTH('dbo.owner_profiles', 'review_note') IS NULL
BEGIN
ALTER TABLE dbo.owner_profiles ADD review_note NVARCHAR(500) NULL;
END
GO

-- Check constraint
IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CK_owner_profiles_verification_status'
      AND parent_object_id = OBJECT_ID('dbo.owner_profiles')
)
BEGIN
ALTER TABLE dbo.owner_profiles
    ADD CONSTRAINT CK_owner_profiles_verification_status
        CHECK (verification_status IN (N'PENDING', N'APPROVED', N'REJECTED'));
END
GO

-- 5) Trigger updated_at
IF OBJECT_ID('dbo.TR_owner_profiles_set_updated_at', 'TR') IS NULL
BEGIN
EXEC('
    CREATE TRIGGER dbo.TR_owner_profiles_set_updated_at
    ON dbo.owner_profiles
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE p
        SET updated_at = SYSUTCDATETIME()
        FROM dbo.owner_profiles p
        INNER JOIN inserted i ON p.id = i.id;
    END
    ');
END
GO

PRINT '✅ Migration V12 hoàn tất thành công!';