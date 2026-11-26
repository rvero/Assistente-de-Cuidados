-- MySQL 8+. Execute uma vez em um banco novo.
-- Se as tabelas antigas já existirem com dados, faça uma migração antes de usar este esquema.
CREATE DATABASE IF NOT EXISTS banco
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE banco;

-- Credenciais compartilhadas pelos dois tipos de conta.
-- password recebe somente o hash BCrypt gerado pelo backend.
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE, -- Obrigatório nos novos cadastros; NULL preserva contas anteriores.
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    auth_version INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_users_role CHECK (role IN ('CLIENTE', 'CUIDADOR', 'ADMIN'))
) ENGINE=InnoDB;

-- Perfil do cliente/família; criado quando os dados do paciente forem preenchidos.
CREATE TABLE loginfamilia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    nomepaciente VARCHAR(150) NOT NULL,
    data_nascimento DATE NULL,
    finalidade ENUM('assistencia_incapaz', 'pos_operatorio') NOT NULL,
    alergias TEXT,
    recomendacoes TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_familia_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Perfil profissional; criado quando os dados do cuidador forem preenchidos.
CREATE TABLE logincuidadores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    nomecuidador VARCHAR(150) NOT NULL,
    nomesocial VARCHAR(150),
    genero ENUM('masculino', 'feminino', 'outro') NOT NULL,
    data_nascimento DATE NOT NULL,
    descricao TEXT,
    curriculo_url VARCHAR(500),
    cidade VARCHAR(100),
    valor_hora DECIMAL(10,2),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cuidador_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contatos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    familia_id BIGINT NOT NULL,
    cuidador_id BIGINT NOT NULL,
    criado_em TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_contato_par UNIQUE (familia_id, cuidador_id),
    CONSTRAINT fk_contato_familia FOREIGN KEY (familia_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_contato_cuidador FOREIGN KEY (cuidador_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


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

CREATE TABLE IF NOT EXISTS contratacoes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT,
    cuidador_id BIGINT,
    familia VARCHAR(255),
    cuidador VARCHAR(255),
    cidade VARCHAR(100),
    valor_hora DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    criado_em TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    aceito_em TIMESTAMP(6) NULL,
    encerrado_em TIMESTAMP(6) NULL,
    legado BOOLEAN NOT NULL DEFAULT FALSE,
    paciente_nome VARCHAR(255),
    finalidade VARCHAR(255),
    alergias TEXT,
    orientacoes TEXT,
    INDEX idx_contrato_cliente (cliente_id, status),
    INDEX idx_contrato_cuidador (cuidador_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contratacao_datas (
    contratacao_id BIGINT NOT NULL,
    data_servico DATE NOT NULL,
    PRIMARY KEY (contratacao_id, data_servico),
    CONSTRAINT fk_datas_contrato FOREIGN KEY (contratacao_id) REFERENCES contratacoes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE agendamentos ADD COLUMN contratacao_id BIGINT NULL;
CREATE INDEX idx_reserva_contrato ON agendamentos (contratacao_id);
