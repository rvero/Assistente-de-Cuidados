USE banco;
ALTER TABLE users ADD COLUMN auth_version INT NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS contatos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    familia_id BIGINT NOT NULL,
    cuidador_id BIGINT NOT NULL,
    criado_em TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_contato_par UNIQUE (familia_id, cuidador_id),
    CONSTRAINT fk_contato_familia FOREIGN KEY (familia_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_contato_cuidador FOREIGN KEY (cuidador_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
