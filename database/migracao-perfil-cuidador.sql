-- Execute uma única vez antes de publicar o backend.
ALTER TABLE banco.logincuidadores
    ADD COLUMN foto_url VARCHAR(500) NULL,
    ADD COLUMN instagram_url VARCHAR(500) NULL,
    ADD COLUMN tiktok_url VARCHAR(500) NULL;
