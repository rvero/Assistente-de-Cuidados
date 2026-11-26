-- Execute uma vez no banco existente antes de publicar a API atualizada.
USE banco;

CREATE TABLE IF NOT EXISTS disponibilidade_cuidador (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cuidador_id BIGINT NOT NULL,
    dia_semana ENUM('SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO','DOMINGO') NOT NULL,
    CONSTRAINT uk_disponibilidade_dia UNIQUE (cuidador_id, dia_semana),
    CONSTRAINT fk_disponibilidade_cuidador FOREIGN KEY (cuidador_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS agendamentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    cuidador_id BIGINT NOT NULL,
    data_servico DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AGENDADO',
    CONSTRAINT uk_agendamento_data UNIQUE (cuidador_id, data_servico),
    INDEX idx_agendamento_cliente_data (cliente_id, data_servico),
    CONSTRAINT fk_agendamento_cliente FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_agendamento_cuidador FOREIGN KEY (cuidador_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
