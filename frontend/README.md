# Assistente de Cuidados — interface

Aplicativo mobile desenvolvido com Ionic, Angular e TypeScript. A interface permite criar uma conta, entrar, sair e preencher o perfil de família ou cuidador.

## Executar a apresentação local

Na raiz do projeto:

```powershell
.\start-demo.ps1
```

Abra http://localhost:8081 após a inicialização. A interface compilada e a API usam o mesmo endereço. O MySQL precisa estar configurado conforme ../database/README.md.

O roteiro para apresentar em outro computador, incluindo a execução sem recompilar, está em ../DEMONSTRACAO.md.

## Desenvolver a interface

Na pasta frontend:

```powershell
npm ci
npm start
```

Abra http://localhost:4200. O arquivo proxy.conf.json encaminha /api para http://127.0.0.1:8081. Mantenha o backend iniciado.

## Telas disponíveis

- Início: escolha entre criar uma conta de família ou cuidador;
- cadastro: nome, e-mail, senha e tipo de conta;
- login: acesso por e-mail e senha;
- conta: dados do usuário e acesso ao perfil;
- perfil: formulário de família/paciente ou de cuidador, com leitura e gravação autenticadas.

A interface usa Família; o identificador correspondente no backend continua sendo CLIENTE. Cuidador corresponde a CUIDADOR. O cadastro não conclui o perfil detalhado: os dados são preenchidos depois, na opção Meu perfil.

## Textos e aparência

Os textos devem ser claros, naturais e formais. Use nomes consistentes para telas, campos e ações. As mensagens de erro precisam explicar o que aconteceu e como continuar. Evite slogans, termos técnicos desnecessários e promessas sobre funções ainda indisponíveis.

O visual segue Arial, títulos de 24 px, textos de 16 px, botões de 48 px e espaçamento em múltiplos de 8 px. A paleta fica em src/theme/variables.scss; os estilos compartilhados, em src/global.scss. O layout usa uma coluna, com largura máxima de 480 px em telas maiores.

## Sessão

No Android/iOS, o armazenamento usa capacitor-secure-storage-plugin. Após adicionar uma plataforma nativa, execute npx cap sync e configure o endereço HTTPS da API para o dispositivo.

No navegador de desenvolvimento, a sessão usa localStorage para testes locais. Na versão compilada, o token fica em memória; ao recarregar a página, pode ser necessário entrar novamente. Os dados do perfil permanecem no MySQL.

## Verificações

```powershell
npm run lint
npm run build
npm run test:unit
npm run test:e2e
```

Os testes de navegação verificam cadastro, login, seleção de perfil, controle de acesso, edição de dados e recuperação de falhas.

