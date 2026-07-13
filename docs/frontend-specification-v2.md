# Especificação do Frontend v2 — shop-api

## 1. Objetivo

Definir o MVP da SPA de e-commerce `shop-api`, implementada em `/frontend`, com fidelidade visual ao protótipo em `docs/ideacao` e integração estrita com o contrato publicado em `openapi.yaml`.

Este documento substitui conceitualmente, sem alterar ou excluir, as especificações anteriores. Em caso de divergência documental, a ordem de precedência é:

1. `openapi.yaml` para rotas, autenticação, payloads e respostas;
2. `docs/ideacao` para linguagem visual, composição e comportamento de interface;
3. `docs/api-reference.md` apenas como material explicativo quando não contradizer o OpenAPI.

## 2. Decisões confirmadas

- Nome do produto: `shop-api`.
- Aplicação exclusivamente SPA, sem páginas renderizadas no servidor.
- Stack aprovada: React, TypeScript, Vite, Tailwind CSS v4, Zod, Zustand, React Router, TanStack Query, React Hook Form, Vitest, Testing Library, MSW e Playwright.
- O OpenAPI prevalece sobre a referência textual da API.
- Não existe carrinho anônimo no MVP. O usuário deve autenticar-se antes de adicionar o primeiro produto.
- Cadastro, checkout e detalhe do pedido fazem parte do MVP, mesmo sem tela correspondente no protótipo.
- Funcionalidades exibidas no protótipo sem suporte no OpenAPI serão removidas do MVP.

## 3. Escopo do MVP

### 3.1 Incluído

- Navegação pública pelo catálogo, busca, categorias e detalhe do produto.
- Cadastro, login, persistência opcional da sessão, expiração local e logout.
- Proteção de rotas e retorno à página de origem após autenticação.
- Criação e manutenção de um carrinho autenticado.
- Checkout com endereço de entrega e forma de pagamento.
- Criação de pedido e confirmação de sucesso.
- Consulta paginada, filtro por período, detalhe e cancelamento de pedido.
- Consulta, edição e cancelamento da conta do cliente.
- Alteração de senha.
- Estados de carregamento, vazio, erro, indisponibilidade e sucesso.
- Layout responsivo e acessível alinhado ao protótipo.

### 3.2 Fora do MVP

- Carrinho anônimo ou sincronização de carrinho criado antes do login.
- Recuperação de senha.
- Avaliações, notas e comentários de produtos.
- Preço promocional, preço anterior, cupom ou desconto por Pix.
- Cálculo, promessa ou gratuidade de frete.
- Rastreamento de entrega, previsão de chegada e histórico logístico.
- Nota fiscal e download de documentos.
- Recompra de pedido.
- Galeria com múltiplas imagens.
- Especificações técnicas estruturadas além de `descricao` e `modelo`.
- Produtos recomendados ou relacionados.
- Múltiplos endereços salvos.
- Refresh token, login social ou autenticação multifator.
- Painel administrativo.

Textos, links e indicadores dessas funcionalidades não devem aparecer como ações simuladas ou links sem destino.

## 4. Usuário e jornadas

### 4.1 Visitante

Pode consultar categorias, buscar produtos, paginar resultados, abrir o detalhe e criar uma conta. Ao tentar adicionar um produto, deve ser encaminhado ao login, sem criar ou persistir itens localmente. Após autenticar-se, retorna à rota de origem e pode repetir a ação.

### 4.2 Cliente autenticado

Pode criar e gerenciar o carrinho, finalizar uma compra, consultar e cancelar pedidos, alterar dados pessoais, trocar a senha, cancelar a conta e encerrar a sessão.

### 4.3 Jornadas principais

1. Visitante navega no catálogo → abre produto → tenta adicionar → autentica-se → retorna ao produto → adiciona ao carrinho.
2. Visitante cria conta → recebe confirmação → entra com as credenciais cadastradas.
3. Cliente adiciona produtos → revisa quantidades → abre checkout → confirma endereço e pagamento → cria pedido → visualiza confirmação.
4. Cliente abre pedidos → filtra por período → abre detalhe → cancela pedido quando a API aceitar a transição.
5. Cliente abre a conta → edita dados ou senha → recebe confirmação.

## 5. Mapa de rotas da SPA

| Rota | Acesso | Tela | Fonte principal |
|---|---|---|---|
| `/` | Público | Catálogo/Home | Produtos e categorias |
| `/produtos/:produtoId` | Público | Detalhe do produto | Produto por ID |
| `/entrar` | Público | Login | Auth/login |
| `/cadastro` | Público | Cadastro de cliente | Cliente/create |
| `/carrinho` | Protegido | Carrinho | Carrinho/get e itens |
| `/checkout` | Protegido | Checkout | Cliente/get e Pedido/create |
| `/pedido-confirmado/:pedidoId` | Protegido | Confirmação do pedido | Resultado da criação |
| `/pedidos` | Protegido | Lista de pedidos | Pedido/list |
| `/pedidos/:pedidoId` | Protegido | Detalhe do pedido | Pedido/get e cancel |
| `/minha-conta/dados` | Protegido | Dados pessoais | Cliente/get/update/delete |
| `/minha-conta/senha` | Protegido | Troca de senha | Cliente/update password |
| `*` | Público | Página não encontrada | Cliente |

Rotas protegidas devem guardar somente a URL de retorno segura e interna. Não devem aceitar redirecionamento absoluto fornecido por query string.

## 6. Requisitos funcionais

### 6.1 Estrutura global

- **RF-001:** O header deve exibir marca, busca, acesso ao carrinho e menu do cliente.
- **RF-002:** Em telas pequenas, a busca e a navegação por categoria devem permanecer acessíveis sem provocar overflow horizontal da página.
- **RF-003:** O menu do cliente deve refletir imediatamente o estado autenticado ou desautenticado.
- **RF-004:** O badge do carrinho deve representar a soma das quantidades confirmadas pelo backend.
- **RF-005:** O footer deve manter a composição visual do protótipo, removendo links sem funcionalidade no MVP.
- **RF-006:** Toda navegação deve ocorrer pelo React Router, sem recarga completa da SPA.

### 6.2 Autenticação

- **RF-010:** O login deve validar e-mail e senha antes de chamar `POST /api/v1/auth/login`.
- **RF-011:** A opção “manter conectado” deve persistir a sessão no `localStorage`; sem ela, a sessão deve usar `sessionStorage`.
- **RF-012:** A sessão deve armazenar apenas os campos necessários do login, incluindo token, expiração, cliente, usuário e e-mail.
- **RF-013:** Token ausente ou expirado deve invalidar a sessão antes de uma chamada protegida.
- **RF-014:** Uma resposta `401` deve limpar a sessão, limpar dados privados em memória e redirecionar ao login.
- **RF-015:** O logout deve chamar `POST /api/v1/auth/logout`; a sessão local deve ser encerrada mesmo se a chamada falhar por token expirado ou revogado.
- **RF-016:** A interface não deve exibir “Esqueci a senha”, pois não existe endpoint correspondente.

### 6.3 Cadastro

- **RF-020:** O cadastro deve solicitar CPF, nome, nascimento, e-mail, senha, endereço único e celular conforme `CreateClienteRequest`.
- **RF-021:** Máscaras de CPF, CEP e celular devem ser apenas de apresentação; o request deve enviar valores normalizados.
- **RF-022:** O campo WhatsApp deve mapear para `celular.whatsApp`.
- **RF-023:** Após `201`, o usuário deve ser direcionado ao login com confirmação de cadastro; o cadastro não autentica automaticamente.
- **RF-024:** Erros `409` e `422` devem ser apresentados no formulário sem perder os valores preenchidos, exceto senha quando a política de segurança exigir limpeza.

### 6.4 Catálogo e categorias

- **RF-030:** A home deve buscar categorias e primeira página de produtos em paralelo.
- **RF-031:** O catálogo deve usar `page`, `size` e `searchword` de `GET /api/v1/produto`.
- **RF-032:** Busca submetida deve ser representada na URL para permitir atualização, compartilhamento e navegação voltar/avançar.
- **RF-033:** Selecionar categoria deve usar `GET /api/v1/produto/categoria/{categoriaId}`, atualizar a URL e ocultar a paginação, pois esse endpoint não aceita `page` nem `size` no contrato atual.
- **RF-034:** Os cards devem exibir somente categoria, título, imagem ou fallback, preço atual e disponibilidade derivada de `estoque`.
- **RF-035:** Produto com estoque menor que uma unidade não pode ser adicionado.
- **RF-036:** A paginação do catálogo geral e da busca deve usar `pagination.pages`, `size` e `totalItems` retornados pelo backend.
- **RF-037:** Busca sem resultado deve oferecer ação para limpar termo e categoria.

### 6.5 Detalhe do produto

- **RF-040:** A tela deve carregar `GET /api/v1/produto/{id}` e exibir título, categoria, modelo, descrição, foto, preço e estoque.
- **RF-041:** Foto nula deve usar fallback visual consistente, sem quebrar layout ou texto alternativo.
- **RF-042:** A quantidade deve ser inteira, mínima `1` e máxima igual à parte inteira do estoque disponível.
- **RF-043:** Produto indisponível deve exibir estado esgotado e CTA desabilitado.
- **RF-044:** Avaliações, múltiplas imagens, descontos, entrega, especificações inventadas e relacionados não devem ser renderizados.

### 6.6 Regra de autenticação ao adicionar

- **RF-050:** Visitante que acionar “Adicionar” deve ser encaminhado para `/entrar` com retorno interno à página atual.
- **RF-051:** Nenhum item, quantidade, preço ou intenção de compra deve ser persistido antes do login.
- **RF-052:** Após o login, o usuário retorna à origem; a inclusão só ocorre após nova confirmação explícita no botão “Adicionar”.

### 6.7 Carrinho autenticado

- **RF-060:** Na primeira inclusão sem `carrinhoId` persistido para o cliente autenticado, o frontend deve chamar `POST /api/v1/carrinho/criar` sem body.
- **RF-061:** O `carrinhoId` retornado deve ser persistido de forma versionada e associado ao `clienteId` da sessão.
- **RF-062:** A inclusão deve chamar `POST /api/v1/carrinho/items` com `produtoId`, quantidade e preço atual retornado pela API de produtos.
- **RF-063:** Carrinho conhecido deve ser carregado por `GET /api/v1/carrinho/{carrinhoId}`.
- **RF-064:** Como os itens não contêm título nem foto, os produtos únicos devem ser hidratados por cache ou chamadas de detalhe em paralelo.
- **RF-065:** Alteração de quantidade deve chamar `PATCH /api/v1/carrinho/items/{itemId}`.
- **RF-066:** Remoção deve pedir confirmação e chamar `DELETE /api/v1/carrinho/items/{itemId}`.
- **RF-067:** Falha em mutação deve restaurar o último estado confirmado e apresentar erro acionável.
- **RF-068:** O resumo deve exibir somente subtotal calculado a partir dos itens e total equivalente; frete e descontos não fazem parte do MVP.
- **RF-069:** Carrinho vazio deve apresentar estado vazio e link para o catálogo.

### 6.8 Checkout e criação do pedido

- **RF-070:** O checkout deve exigir carrinho não vazio e sessão válida.
- **RF-071:** O endereço deve ser inicializado com `GET /api/v1/cliente/{clienteId}` e permanecer editável apenas para o pedido atual.
- **RF-072:** As formas de pagamento permitidas são exatamente `Pix`, `Cartao` e `Boleto`.
- **RF-073:** O request de `POST /api/v1/pedido` deve seguir o OpenAPI e conter apenas `enderecoEntrega`, `formaPagamento`, `dataPedido` e `items`.
- **RF-074:** O request não deve enviar `clienteId` nem `carrinhoId`.
- **RF-075:** `dataPedido` deve ser gerada em ISO 8601 no momento da confirmação.
- **RF-076:** Durante o envio, o CTA deve impedir submissões duplicadas.
- **RF-077:** Após `201`, o frontend deve invalidar caches de pedidos, remover o `carrinhoId` local do cliente e abrir a confirmação.
- **RF-078:** O frontend não deve alegar autorização do pagamento, entrega ou emissão de nota fiscal.

### 6.9 Pedidos

- **RF-080:** A lista deve obter o CPF do perfil autenticado e chamar `GET /api/v1/pedido` com CPF, período, página e tamanho.
- **RF-081:** Filtros suportados serão data inicial e data final; chips de status do protótipo não serão usados, pois a API não aceita status como filtro.
- **RF-082:** Status exibidos devem corresponder exatamente a `Criado`, `EmProcessamento`, `Processado`, `Cancelado` e `Devolvido`, com rótulos amigáveis.
- **RF-083:** O total visual deve ser calculado pela soma de `quantidade × valorUnitario` dos itens retornados.
- **RF-084:** O detalhe deve usar `GET /api/v1/pedido/{pedidoId}` e exibir endereço, data, pagamento, status e itens.
- **RF-085:** Nomes e imagens de itens devem ser hidratados em paralelo por produto, com fallback caso o produto não exista mais.
- **RF-086:** A ação cancelar deve enviar exclusivamente `{ "status": "Cancelado" }` para `PATCH /api/v1/pedido/{pedidoId}`.
- **RF-087:** A API é autoridade sobre transições. Respostas `422` devem atualizar o pedido e explicar que o cancelamento não foi aceito.

### 6.10 Conta do cliente

- **RF-090:** A tela de dados deve carregar o cliente exclusivamente pelo `clienteId` da sessão.
- **RF-091:** A atualização deve enviar o objeto completo de `UpdateClienteRequest` por `PUT`.
- **RF-092:** CPF deve permanecer visível e editável conforme o contrato, com alerta de confirmação antes de enviar uma alteração.
- **RF-093:** O formulário deve manter separados logradouro, número e complemento.
- **RF-094:** A troca de senha deve enviar `senhaAtual` e `senhaNova` ao endpoint correspondente.
- **RF-095:** A validação visual de senha seguirá o protótipo: mínimo de oito caracteres, uma maiúscula, um número e um caractere especial entre `!@#$%`.
- **RF-096:** O cancelamento da conta deve ficar em área de perigo, exigir confirmação explícita e chamar `DELETE /api/v1/cliente/{clienteId}`.
- **RF-097:** Após cancelamento bem-sucedido, a sessão e todos os dados privados locais devem ser removidos.

## 7. Contrato de integração

### 7.1 Regras gerais

- A URL base vem de `VITE_API_BASE_URL`, sem valor de produção embutido no bundle.
- Respostas externas são dados não confiáveis e devem passar por schemas Zod antes de entrar no domínio da UI.
- IDs e valores numéricos devem aceitar a união `number | string` descrita no OpenAPI e ser normalizados em adapters.
- Datas permanecem strings ISO no transporte e são formatadas somente na camada de apresentação.
- `ApiResponse<T>.data` pode ser nulo; o cliente deve tratar sucesso sem dados como falha de contrato quando a tela exigir o recurso.
- Erros seguem `ApiErrorResponse` e devem ser normalizados para um tipo único de erro da aplicação.
- O cliente não deve depender de texto exato de `message` para decidir regras.
- Requests protegidos usam `Authorization: Bearer <token>`.
- `401` invalida autenticação; `404` apresenta recurso inexistente; `409` apresenta conflito; `422` associa detalhes ao formulário quando possível; falhas `5xx` apresentam recuperação sem expor detalhes internos.

### 7.2 Mapeamento de endpoints

| Feature | Método e endpoint | Acesso |
|---|---|---|
| Login | `POST /api/v1/auth/login` | Público |
| Logout | `POST /api/v1/auth/logout` | Protegido |
| Cadastro | `POST /api/v1/cliente` | Público |
| Perfil | `GET/PUT/DELETE /api/v1/cliente/{clienteId}` | Protegido |
| Senha | `PUT /api/v1/cliente/{clienteId}/senha` | Protegido |
| Categorias | `GET /api/v1/categoria` | Público |
| Catálogo | `GET /api/v1/produto` | Público |
| Produto | `GET /api/v1/produto/{id}` | Público |
| Categoria | `GET /api/v1/produto/categoria/{categoriaId}` | Público |
| Criar carrinho | `POST /api/v1/carrinho/criar` sem body | Protegido |
| Ler carrinho | `GET /api/v1/carrinho/{carrinhoId}` | Protegido |
| Adicionar item | `POST /api/v1/carrinho/items` | Protegido |
| Alterar item | `PATCH /api/v1/carrinho/items/{itemId}` | Protegido |
| Remover item | `DELETE /api/v1/carrinho/items/{itemId}` | Protegido |
| Criar/listar pedido | `POST/GET /api/v1/pedido` | Protegido |
| Detalhar/cancelar pedido | `GET/PATCH /api/v1/pedido/{pedidoId}` | Protegido |

## 8. Direção visual

### 8.1 Tokens obrigatórios

- Fonte: Inter, com fallback de sistema.
- Brand: `#f59e0b` como CTA, `#fbbf24` para destaque e foco.
- Superfícies: `#08080b`, `#0d0d12`, `#121219`, `#18181f`, `#1e1e27`, `#262631`, `#34343f`.
- Sucesso: emerald; alerta: amber; erro/perigo: rose.
- Raios principais: `1rem` e `1.25rem`.
- Grade de espaçamento: múltiplos de 4 px, priorizando 8, 12, 16 e 24 px.
- Container: largura máxima equivalente a `max-w-7xl`, com padding responsivo.

### 8.2 Princípios

- Dark mode minimalista é o único tema do MVP.
- Amber deve ser reservado para marca, foco, seleção e CTA principal.
- Hierarquia deve ser criada por contraste de superfícies, tamanho e espaçamento, não por excesso de bordas.
- Cards devem preservar a sensação do protótipo, sem badges promocionais inventados.
- Skeletons devem respeitar as dimensões finais para reduzir mudança de layout.
- Animações devem ser curtas, dispensáveis e desativadas com `prefers-reduced-motion`.

## 9. Acessibilidade e responsividade

- **RNF-001:** Atender WCAG 2.2 nível AA nos fluxos principais.
- **RNF-002:** Toda ação deve funcionar por teclado e possuir foco visível.
- **RNF-003:** Menus, dialogs, alertas e validações devem expor nome, função, estado e relação corretos.
- **RNF-004:** Erros de formulário devem ser associados ao campo e resumidos no topo quando houver múltiplas falhas.
- **RNF-005:** Mudanças assíncronas relevantes devem usar região viva sem anunciar atualizações redundantes.
- **RNF-006:** Alvos interativos devem ter pelo menos 40 × 40 px; CTAs primários em mobile devem usar 44 px ou mais.
- **RNF-007:** O conteúdo deve funcionar entre 320 px e 1920 px, sem scroll horizontal acidental.
- **RNF-008:** Cards, tabelas visuais e ações devem reorganizar-se para uma coluna em mobile.

## 10. Desempenho, segurança e confiabilidade

- **RNF-010:** Rotas de conta, pedidos e checkout devem ser carregadas sob demanda.
- **RNF-011:** Categorias e primeira página de produtos devem iniciar em paralelo.
- **RNF-012:** Hidratação de produtos do carrinho e pedidos deve usar `Promise.all`, deduplicação e cache por `produtoId`.
- **RNF-013:** Estado de servidor pertence ao TanStack Query; Zustand não deve duplicar listas ou respostas completas.
- **RNF-014:** Persistência local deve ser mínima e versionada. Logout remove autenticação e caches privados, mas pode conservar somente o vínculo `clienteId` → `carrinhoId`; cancelamento da conta remove também esse vínculo.
- **RNF-015:** Nenhum HTML retornado pela API deve ser renderizado como markup.
- **RNF-016:** O frontend deve evitar logs com token, senha, CPF, endereço ou detalhes de erro sensíveis.
- **RNF-017:** Mutação com valor de preço enviado pelo cliente deve usar exclusivamente o último valor obtido da API; o frontend não o considera autoridade final.
- **RNF-018:** A aplicação deve oferecer retry manual para consultas e não repetir automaticamente mutações não idempotentes.

## 11. Critérios de aceite do MVP

- Todos os requisitos incluídos possuem teste proporcional ao risco.
- Nenhuma funcionalidade fora do MVP aparece como ação disponível.
- Todas as rotas e payloads usados correspondem ao `openapi.yaml`.
- Os fluxos de login, cadastro, catálogo, carrinho, checkout, pedidos, perfil e senha funcionam em desktop e mobile.
- Erros `401`, `404`, `409` e `422` possuem comportamento verificável.
- Build, typecheck, lint, testes de unidade/integração e testes E2E críticos passam.
- Não existem erros de console nos fluxos principais.
- A auditoria de teclado, contraste, nomes acessíveis e redução de movimento está concluída.


