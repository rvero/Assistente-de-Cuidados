# Publicar o Assistente de Cuidados

O repositório está preparado para Netlify (interface), Render (API) e TiDB Cloud (banco). A publicação ainda precisa ser feita nas suas contas.

## 1. Criar o banco no TiDB

1. Crie uma instância com conexão compatível com MySQL no [TiDB Cloud](https://tidbcloud.com/).
2. No editor SQL, execute o arquivo `database/tidb.sql` completo. Ele cria o banco `banco` e as tabelas. Use em um banco novo; não execute sobre tabelas com dados.
3. Na opção de conexão, copie host, porta, usuário e senha. O usuário deve ser copiado inteiro, incluindo qualquer prefixo.

O arquivo cria a estrutura, sem copiar as contas locais. Os novos cadastros serão gravados no TiDB. O administrador será criado pela API.

## 2. Obter o endereço do Netlify

1. Entre no [Netlify](https://app.netlify.com/) e importe este repositório do GitHub.
2. O arquivo `netlify.toml` já define a pasta `frontend`, o comando `npm run build:netlify`, a saída `www` e o Node 26.
3. Copie o endereço do site, por exemplo `https://seu-app.netlify.app`.

A primeira compilação pode falhar por falta de `API_BASE_URL`. Você preencherá essa variável depois de criar a API.

## 3. Criar a API no Render

No [Render](https://dashboard.render.com/), escolha **New > Blueprint**, conecte o repositório e selecione a branch `main`. O Render lerá `render.yaml`, que usa o Dockerfile do backend.

Preencha as variáveis solicitadas:

| Variável | Valor |
| --- | --- |
| `DB_URL` | `jdbc:mysql://HOST_DO_TIDB:4000/banco?sslMode=VERIFY_IDENTITY` |
| `DB_USERNAME` | Usuário completo fornecido pelo TiDB |
| `DB_PASSWORD` | Senha do banco |
| `CORS_ALLOWED_ORIGINS` | Endereço HTTPS do Netlify, sem barra no final |
| `ADMIN_EMAIL` | E-mail que você usará para administrar |
| `ADMIN_PASSWORD` | Senha própria, com pelo menos 12 caracteres e no máximo 72 bytes em UTF-8 |

Use a porta indicada pelo TiDB se for diferente de 4000. A conexão exige TLS e valida o certificado do servidor.

O Blueprint configura `SPRING_PROFILES_ACTIVE=cloud`, gera `JWT_SECRET` e define `/api/health` como verificação de disponibilidade. Não substitua a chave JWT por uma senha curta. O backend usa a porta fornecida pelo Render.

Aguarde a publicação. Abra `https://SUA-API.onrender.com/api/health`: a resposta esperada é `{"status":"UP"}`.

O administrador de demonstração local não é criado no perfil `cloud`. A conta configurada acima é criada apenas se não existir; mudar `ADMIN_PASSWORD` no Render não altera a senha de uma conta já criada. Se o e-mail pertencer a uma família ou cuidador, a API interrompe a inicialização para evitar promover essa conta.

## 4. Conectar a interface à API

1. No Netlify, abra as variáveis de ambiente do site.
2. Adicione `API_BASE_URL` com a origem HTTPS da API, por exemplo `https://SUA-API.onrender.com`. Não acrescente `/api` ou outras rotas.
3. Execute uma nova publicação do site.

A compilação gera as regras de encaminhamento: `/api/*` segue para o Render e as páginas do aplicativo seguem para o Angular. O navegador acessa o aplicativo pelo endereço do Netlify.

## 5. Conferir

1. Entre com o administrador configurado no Render.
2. Cadastre uma família e um cuidador usando dados de demonstração e CPFs válidos distintos.
3. Preencha os perfis, busque o cuidador e envie um contato pela família.
4. Confira os dados do paciente na área do cuidador e as duas contas no painel administrativo.
5. Abra uma rota diretamente, como `/login`, para conferir a navegação do Angular.

No plano gratuito, o Render pode suspender a API após inatividade. Antes da apresentação, abra `/api/health` e espere a resposta. A retomada pode demorar cerca de um minuto; o proxy do Netlify tem limite de 26 segundos, então a primeira tentativa de login pode falhar enquanto a API desperta. Tente novamente após a resposta de saúde.

## Atualizações e credenciais

Com as publicações automáticas habilitadas nas plataformas, novos commits no GitHub geram novas versões. Alterações de estrutura do banco precisam de uma migração; `tidb.sql` é para a instalação inicial.

Senhas do banco, senha administrativa e chave JWT ficam nas variáveis do Render. Não coloque esses valores no código ou no GitHub. `API_BASE_URL` é um endereço público, sem credenciais. Se mudar o endereço da interface, atualize `CORS_ALLOWED_ORIGINS`; vários endereços exatos podem ser separados por vírgula.

Referências: [Blueprint do Render](https://render.com/docs/blueprint-spec), [proxy do Netlify](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/).
