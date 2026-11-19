# Banco de dados e backend

O aplicativo utiliza MySQL 8.4. O frontend acessa os dados pela API do Spring Boot; não há conexão direta entre a interface e o banco.

## Estrutura

- users: nome, e-mail, senha criptografada com BCrypt e tipo da conta;
- loginfamilia: dados de um paciente, vinculados à conta de família por user_id;
- logincuidadores: dados profissionais, vinculados à conta de cuidador por user_id.

E-mail e senha ficam apenas em users. O identificador CLIENTE representa o perfil Família na interface. CUIDADOR representa Cuidador.

## Preparar o MySQL

Execute banco.sql em uma instalação nova do MySQL. O script cria o banco banco e suas três tabelas.

Se as tabelas já existirem e contiverem dados, não execute o script por cima delas. Faça uma cópia de segurança e prepare uma migração.

Configure um usuário MySQL com acesso ao banco. Para executar o aplicativo, ele precisa de SELECT, INSERT, UPDATE e DELETE. O Hibernate valida o esquema ao iniciar e não altera as tabelas do MySQL.

Na raiz do projeto, informe as credenciais daquela máquina:

```powershell
$env:DB_URL = 'jdbc:mysql://127.0.0.1:3306/banco'
$env:DB_USERNAME = 'seu_usuario_mysql'
$env:DB_PASSWORD = 'sua_senha_mysql'
.\start-demo.ps1
```

Não registre credenciais reais no Git. O script também usa JAVA_HOME ou o JDK portátil disponível em .local/java.

## Perfis e autenticação

| Método | Rota | Função |
| --- | --- | --- |
| POST | /api/auth/register | Criar uma conta |
| POST | /api/auth/login | Entrar |
| GET | /api/users/me | Consultar a conta autenticada |
| GET / PUT | /api/cliente/perfil | Consultar ou salvar o perfil da família |
| GET / PUT | /api/cuidador/perfil | Consultar ou salvar o perfil do cuidador |

As rotas sem o prefixo /api continuam disponíveis por compatibilidade.

O cadastro recebe nome, email, password e tipo. O login recebe email e password; tipo é opcional no backend e não é solicitado na interface.

A consulta do perfil retorna 204 quando ele ainda não foi preenchido. A gravação cria ou atualiza o perfil do usuário autenticado, sem receber user_id no corpo da requisição. O backend verifica o proprietário e o tipo de conta.

Os formulários validam campos obrigatórios, limites de tamanho, datas anteriores ao dia atual, opções permitidas e endereço HTTP/HTTPS do currículo. As respostas distinguem dados inválidos (400), sessão ausente ou inválida (401) e acesso não permitido (403).

## Dados nesta máquina

O MySQL portátil está em .local/mysql e os dados, em .local/mysql-data. As credenciais ficam em .local/mysql-credentials.json. Essas pastas e arquivos são ignorados pelo Git.

O perfil local H2 foi preservado em backend/data para compatibilidade; seus dados não foram apagados nem migrados automaticamente. A apresentação atual utiliza MySQL.

Não copie a pasta de dados de um MySQL em execução.


## Apresentação local

O endereço local é http://localhost:8081. Para TiDB Cloud, importe `tidb.sql` em um banco novo e configure a API no Render com as credenciais de conexão.



Para bancos criados antes do campo CPF, execute `migracao-cpf.sql` uma única vez, antes de iniciar o backend atualizado. A migração preserva as contas existentes. Novas contas exigem CPF válido e exclusivo; a validação dos dígitos não comprova a identidade do titular.


Administração: em bancos existentes, execute também `migracao-admin.sql` uma vez. Na inicialização local, o backend cria `admin@admin.com`, senha `admin123`, se esse e-mail ainda não existir. O painel lista contas de família e cuidador, permite consultar seus perfis e excluir uma conta com seus dados. A conta de administração não pode ser excluída pelo painel.


Barra de navegação e conta: em bancos existentes, aplique `migracao-contatos.sql` uma única vez. Ela adiciona a versão de autenticação em `users` e a tabela `contatos`. A alteração dos dados da conta exige senha atual e renova a sessão. A exclusão remove os perfis e os contatos associados. Novos bancos devem usar o `banco.sql` atualizado.

Na hospedagem com o perfil `cloud`, o administrador é criado com `ADMIN_EMAIL` e `ADMIN_PASSWORD` do Render. A senha precisa ter pelo menos 12 caracteres e no máximo 72 bytes em UTF-8.
