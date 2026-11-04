-- Execute uma vez para atualizar um banco já existente. Não apaga contas.
USE banco;
ALTER TABLE users ADD COLUMN cpf VARCHAR(11) NULL UNIQUE;
