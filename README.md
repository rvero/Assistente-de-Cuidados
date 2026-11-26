https://assistente-de-cuidados.netlify.app/

Para atualizar um banco existente com a agenda, execute `database/migracao-agenda.sql` no TiDB antes de publicar o backend. Em bancos novos, use `database/tidb.sql`.

Para atualizar para o fluxo de contratação, execute `database/migracao-contratos.sql` uma única vez, após `migracao-agenda.sql`, antes de publicar a nova API. Essa migração preserva os agendamentos anteriores no histórico.
