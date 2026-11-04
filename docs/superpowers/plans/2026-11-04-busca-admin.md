# Busca, perfis e administração
1. Backend: listar todos os usuários CUIDADOR com dados públicos e detalhe por ID, usando nome de cadastro quando o perfil estiver vazio. Admin lista dados de conta e perfis completos sem senhas; exclusão transacional remove perfis e conta. Tokens de contas excluídas deixam de funcionar.
2. Admin: criar conta admin@admin.com com hash BCrypt de admin123 apenas quando ausente; bloquear criação pública de administrador. Adicionar ADMIN às permissões e ao banco existente.
3. Frontend mobile: busca por nome/experiência, cartões e detalhe sem avaliações; navegação para editar perfil existente. Painel administrativo com filtro, detalhes e confirmação de exclusão.
4. Verificar: testes HTTP de autorização, listagem de perfis vazios, atualização visível e exclusão; testes de navegador e build. Reiniciar backend local e verificar MySQL.
