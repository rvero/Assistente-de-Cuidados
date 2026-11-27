https://assistente-de-cuidados.netlify.app/


### Fotos dos cuidadores

As fotos são armazenadas no Cloudinary. No Render, configure:

- `CLOUDINARY_CLOUD_NAME`: nome do ambiente Cloudinary.
- `CLOUDINARY_API_KEY`: chave da API.
- `CLOUDINARY_API_SECRET`: segredo da API, somente no backend.

Esses valores ficam em **Cloudinary → Settings → API Keys**. Não coloque o segredo no Netlify ou no GitHub. Não é necessário criar upload preset: o backend assina e envia as imagens.

Antes de publicar esta versão, execute uma vez o arquivo `database/migracao-perfil-cuidador.sql` no banco `banco` do TiDB. Ele adiciona os campos de foto, Instagram e TikTok. Instalações novas já usam a estrutura atualizada em `database/tidb.sql`.

São aceitas fotos JPG/PNG de até 2 MB e 12 megapixels. O backend reduz a imagem para até 800 pixels e remove os metadados antes do envio. Sem as variáveis do Cloudinary, o restante do aplicativo continua funcionando, mas o envio de fotos fica indisponível. A foto e os links são públicos no perfil; arquivos enviados só passam a constar no perfil após salvar as alterações. Fotos substituídas ou removidas são excluídas após salvar. A exclusão da conta também remove os envios do usuário. Se a limpeza falhar após três tentativas, o backend registra o aviso para remoção pela Media Library.
