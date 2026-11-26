-- Execute este comando inteiro uma única vez, antes de publicar a nova versão.
ALTER TABLE banco.contratacoes
    ADD COLUMN conclusao_familia_em TIMESTAMP(6) NULL,
    ADD COLUMN conclusao_cuidador_em TIMESTAMP(6) NULL;
