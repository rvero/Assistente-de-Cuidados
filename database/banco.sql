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
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    CONSTRAINT chk_users_role CHECK (role IN ('CLIENTE', 'CUIDADOR'))
) ENGINE=InnoDB;

-- Perfil do cliente/família; criado quando os dados do paciente forem preenchidos.
CREATE TABLE loginfamilia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    nomepaciente VARCHAR(150) NOT NULL,
    data_nascimento DATE NOT NULL,
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
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cuidador_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
