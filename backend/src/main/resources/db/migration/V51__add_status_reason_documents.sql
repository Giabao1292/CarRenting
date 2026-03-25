ALTER TABLE documents
    ADD status VARCHAR(20) NULL;

ALTER TABLE documents
    ADD reason NVARCHAR(500) NULL;