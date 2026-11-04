# Barra inferior, conta e contatos
1. Barra global fixa apenas para CLIENTE/CUIDADOR: recibo Histórico; lupa Buscar ou pessoas Contatos; engrenagem Opções. Reservar espaço no outlet, remover navegação duplicada.
2. Conta própria: GET/PUT/DELETE /api/conta, confirmação da senha atual, validação/normalização de CPF e e-mail, renovar sessão ao editar, remover perfis e contatos ao excluir. Família edita apenas nome, e-mail, CPF e senha; cuidador mantém edição profissional separada.
3. Contatos: família registra interesse no perfil do cuidador, com aviso sobre nome/e-mail compartilhados; profissional consulta apenas seus próprios contatos. Uma entrada por par família/cuidador; remoção junto da conta.
4. Histórico vazio e transparente enquanto pagamentos não estão implementados. Testar permissões, edição e exclusão da conta, contatos, barra em cada rota e tamanho mobile.
