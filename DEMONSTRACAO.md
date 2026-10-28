# Apresentação local na faculdade

O aplicativo será apresentado no navegador do computador da faculdade, em http://localhost:8081. Não é necessário publicar o projeto nem usar o link da internet. O compartilhamento público anterior foi encerrado.

## O que levar

Copie o projeto e, se quiser executar sem compilar na faculdade, inclua estas pastas e arquivos que normalmente não entram no Git:

- frontend/www/ — interface compilada;
- backend/target/cuidado-de-idosos-0.0.1-SNAPSHOT.jar — backend com as dependências;
- start-demo.ps1;
- criar-contas-teste.ps1;
- database/banco.sql.

Mantenha a estrutura de pastas do projeto. O aplicativo encontra a interface a partir dessa estrutura.

No computador da faculdade, prepare Java 25 (JDK) e MySQL 8.4. Para compilar o projeto nesse computador, também serão necessários Node.js, npm e acesso à internet para baixar as dependências. Se levar a interface e o backend já compilados, Node.js e Maven não serão necessários para a apresentação.

Não copie a pasta de dados de um MySQL enquanto ele estiver em execução. Para a apresentação, o caminho mais simples é criar um banco novo com o esquema do projeto e usar apenas dados fictícios.

## Preparar o banco no computador da faculdade

1. Abra database/banco.sql no cliente MySQL e execute o script em uma instalação que ainda não tenha essas tabelas.
2. Configure um usuário MySQL com acesso ao banco banco. Para executar o aplicativo, ele precisa de SELECT, INSERT, UPDATE e DELETE.
3. Em um terminal PowerShell na raiz do projeto, configure os valores correspondentes àquela máquina:

```powershell
$env:JAVA_HOME = 'C:\caminho\do\jdk-25'
$env:DB_URL = 'jdbc:mysql://127.0.0.1:3306/banco'
$env:DB_USERNAME = 'seu_usuario_mysql'
$env:DB_PASSWORD = 'sua_senha_mysql'
.\start-demo.ps1 -UsePackage
```

Substitua os exemplos pelos caminhos e credenciais reais. O script cria uma chave de sessão local; não é preciso editar o código. Mantenha o terminal aberto e aguarde a inicialização do servidor.

Se precisar compilar o projeto na faculdade, execute npm ci na pasta frontend antes e utilize .\start-demo.ps1 sem -UsePackage. O primeiro preparo das dependências exige internet.

## Criar as contas para a apresentação

Com o aplicativo iniciado, abra outro terminal na raiz do projeto:

```powershell
.\criar-contas-teste.ps1
```

O script cria as contas abaixo e verifica o login. Se uma delas já existir, ele não altera a senha nem os dados do perfil.

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Família | testefamilia@exemplo.com | 123456 |
| Cuidador | testecuidador@exemplo.com | 123456 |

Os perfis podem ser preenchidos pela própria interface. Use nomes e informações fictícios.

## Roteiro da apresentação

1. Abra http://localhost:8081.
2. Entre com a conta de família e selecione **Meu perfil**.
3. Preencha nome, nascimento, motivo do cuidado, alergias e orientações. Selecione **Salvar perfil**.
4. Saia e entre novamente para mostrar que as informações permanecem no MySQL.
5. Repita com a conta de cuidador para apresentar nome, nome social, gênero, nascimento, experiência profissional e endereço do currículo.
6. Crie outra conta, se desejar demonstrar o cadastro. O perfil dela começa vazio.

No computador, o modo de dispositivo do navegador permite mostrar o formato de celular. Também é possível apresentar diretamente na janela normal.

Ao atualizar completamente a página, poderá ser necessário entrar novamente. Os perfis permanecem no banco.

## Nesta máquina

O MySQL e o Java portáteis já estão configurados. Execute .\start-demo.ps1 para compilar e iniciar ou .\start-demo.ps1 -UsePackage para usar a versão que já foi compilada. Os dados atuais ficam em .local/mysql-data. O script recalcula os caminhos do MySQL portátil quando precisa iniciá-lo.

As credenciais do banco e a chave de sessão ficam em .local e não são versionadas. O aplicativo e o MySQL aceitam conexões apenas locais.

## O que está disponível

- Cadastro de famílias e cuidadores;
- login, logout e controle de acesso;
- leitura e edição dos dois tipos de perfil;
- validação dos campos e persistência em MySQL;
- separação dos dados de cada conta.

A busca de cuidadores, as solicitações, a agenda, os contratos, os pagamentos e as avaliações ainda estão em desenvolvimento. Existe um perfil de paciente por conta de família. O currículo é informado por endereço, sem envio de arquivos.

