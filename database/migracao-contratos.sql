-- Execute uma vez no banco existente, depois de migracao-agenda.sql e antes da nova publicação.
USE banco;

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

-- Preserva os agendamentos antigos no histórico. A data original de contratação não existia.
INSERT INTO contratacoes (cliente_id, cuidador_id, familia, cuidador, cidade, valor_hora, status, legado,
                          paciente_nome, finalidade, alergias, orientacoes)
SELECT pares.cliente_id, pares.cuidador_id, f.nome, COALESCE(cp.nomecuidador,c.nome), cp.cidade, cp.valor_hora,
       CASE WHEN pares.ultima_data < DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '-03:00')) THEN 'CONCLUIDO' ELSE 'ACEITO' END,
       TRUE, p.nomepaciente, p.finalidade, p.alergias, p.recomendacoes
FROM (SELECT cliente_id, cuidador_id, MAX(data_servico) ultima_data FROM agendamentos
      WHERE contratacao_id IS NULL GROUP BY cliente_id, cuidador_id) pares
JOIN users f ON f.id=pares.cliente_id
JOIN users c ON c.id=pares.cuidador_id
LEFT JOIN loginfamilia p ON p.user_id=f.id
LEFT JOIN logincuidadores cp ON cp.user_id=c.id;

UPDATE agendamentos a JOIN contratacoes c
ON c.cliente_id=a.cliente_id AND c.cuidador_id=a.cuidador_id AND c.legado=TRUE
SET a.contratacao_id=c.id WHERE a.contratacao_id IS NULL;

INSERT INTO contratacao_datas (contratacao_id, data_servico)
SELECT contratacao_id, data_servico FROM agendamentos WHERE contratacao_id IS NOT NULL;
