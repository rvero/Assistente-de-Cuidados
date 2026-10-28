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

Não copie a pasta de dados de um MySQL em execução. Para levar a apresentação à faculdade, siga ../DEMONSTRACAO.md.

## Testes do backend

Com JAVA_HOME apontando para um JDK 25, execute na pasta backend:

```powershell
.\mvnw.cmd test
```

Os testes usam H2 isolado e verificam inicialização, validação dos perfis e permissões. O fluxo também foi validado no MySQL real pelo navegador.

## Apresentação local

O endereço é http://localhost:8081. O arquivo ../DEMONSTRACAO.md contém os requisitos para outro computador, as contas de teste e o roteiro. O link público anterior não é mais utilizado.

