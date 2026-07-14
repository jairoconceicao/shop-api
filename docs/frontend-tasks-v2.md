# Tarefas do Frontend v2 — shop-api

## Regras do backlog

- Cada item deve resultar em uma mudança pequena, revisável e testável.
- O OpenAPI é a fonte de verdade da integração.
- Uma tarefa de comportamento exige o teste correspondente antes de ser considerada concluída.
- Backend e frontend não podem ser combinados na mesma tarefa.
- A numeração indica identidade, não prioridade; a ordem abaixo expressa as dependências recomendadas.

## Backend

Nenhuma mudança de backend faz parte deste MVP. O frontend consumirá o contrato atual de `openapi.yaml`. Se a integração revelar uma necessidade de CORS ou mudança contratual, ela deverá originar uma nova tarefa de backend, separada deste backlog e aprovada antes da implementação.

## Frontend

### Fase 0 — Fundação

[x] TASK-001: Criar o projeto Vite com React e TypeScript dentro de `/frontend`.

[x] TASK-002: Instalar e configurar React Router, TanStack Query, Zustand, Zod e React Hook Form.

[x] TASK-003: Configurar scripts de desenvolvimento, build, typecheck, lint, testes e testes E2E.

[x] TASK-004: Configurar ESLint e regras de imports diretos sem barrel global.

[x] TASK-005: Integrar Tailwind CSS v4 ao build do Vite.

[x] TASK-006: Migrar a paleta `brand` e `ink`, raios, tipografia e espaçamento de `docs/ideacao` para tokens do tema.

[x] TASK-007: Criar estilos globais de foco, seleção, superfícies, container e redução de movimento.

[x] TASK-008: Configurar Vitest, Testing Library e ambiente DOM.

[x] TASK-009: Configurar MSW com inicialização exclusiva para testes e desenvolvimento opt-in.

[x] TASK-010: Configurar Playwright e um teste smoke da SPA.

[x] TASK-011: Criar schema Zod para validar as variáveis `VITE_API_BASE_URL` e ambiente da aplicação.

[x] TASK-012: Criar schemas Zod dos envelopes `ApiResponse`, `PagedResponse` e `ApiErrorResponse`.

[x] TASK-013: Criar adapters para normalizar IDs e números recebidos como `number | string`.

[x] TASK-014: Criar o tipo `AppError` e o mapeamento uniforme de erros HTTP, rede e contrato.

[x] TASK-015: Implementar o `apiClient` com URL base, JSON, `AbortSignal` e header Bearer opcional.

[x] TASK-016: Configurar QueryClient com retries apenas para leituras recuperáveis e defaults de cache.

[x] TASK-017: Compor providers globais de router, query, feedback e stores.

[x] TASK-018: Criar a árvore inicial de rotas com shells público, loja e conta.

### Fase 1 — Design system e shell

[x] TASK-019: Implementar Button, IconButton e LinkButton com variantes acessíveis.

[x] TASK-020: Implementar Input, Checkbox, Select, FieldError e FormErrorSummary.

[x] TASK-021: Implementar Card, Surface, Badge e Chip com os tokens do protótipo.

[x] TASK-022: Implementar Dialog e DropdownMenu com foco, Escape e retorno de foco.

[x] TASK-023: Implementar Toast, InlineAlert, Skeleton, EmptyState e ErrorState.

[x] TASK-024: Implementar QuantityInput com limites, teclado e nome acessível.

[x] TASK-025: Implementar Pagination com estado atual e navegação por teclado.

[x] TASK-026: Implementar ProductImage com dimensões reservadas, texto alternativo e fallback.

[x] TASK-027: Implementar Header com marca, busca, carrinho e menu do cliente.

[x] TASK-028: Implementar navegação responsiva por categorias no Header.

[x] TASK-029: Implementar Footer removendo links e alegações fora do MVP.

[x] TASK-030: Implementar StoreLayout e AccountLayout responsivos.

[x] TASK-031: Implementar a página 404 com retorno ao catálogo.

### Fase 2 — Autenticação e cadastro

[x] TASK-032: Criar o `authStore` versionado com persistência selecionável entre sessionStorage e localStorage.

[x] TASK-033: Implementar restauração da sessão e invalidação preventiva por `expiraEm`.

[x] TASK-034: Criar schemas e adapter do contrato de login.

[x] TASK-035: Implementar serviço e mutation de `POST /api/v1/auth/login`.

[x] TASK-036: Implementar a página de login sem ação de recuperação de senha.

[x] TASK-037: Implementar opção “manter conectado” e limpeza segura do formulário de login.

[x] TASK-038: Implementar ProtectedRoute com `returnTo` limitado a rotas internas.

[x] TASK-039: Implementar tratamento global de `401` com limpeza de caches privados e redirecionamento.

[x] TASK-040: Implementar logout remoto e limpeza local resiliente a token expirado.

[x] TASK-041: Criar schemas e adapter de `CreateClienteRequest` e resposta de cadastro.

[x] TASK-042: Implementar máscaras de apresentação e normalização de CPF, CEP e celular.

[x] TASK-043: Implementar formulário de cadastro com endereço único e indicador de WhatsApp.

[x] TASK-044: Implementar mutation de cadastro e tratamento de `409` e `422` no formulário.

[x] TASK-045: Implementar redirecionamento do cadastro concluído para o login com mensagem de sucesso.

### Fase 3 — Catálogo e detalhe do produto

[x] TASK-046: Criar schemas e adapters de categoria, catálogo paginado e detalhe do produto.

[x] TASK-047: Implementar query de categorias com cache apropriado.

[x] TASK-048: Implementar query paginada de catálogo com `page`, `size` e `searchword`.

[x] TASK-049: Implementar query de produtos por `categoriaId`.
  - Evidência: commits `2a63a27` e `603fbb2`; testes focused 6/6 e catalog 32/32; typecheck/lint PASS; reviewer approved; teste de IDs reformulado para comportamento observável e revisão final atendida; suíte/build mantêm baselines aceitas fora de escopo.

[x] TASK-050: Implementar parser e serializer da URL para busca, categoria e página.
  - Evidência: commit `468437a`; testes focused 19/19 e catalog 51/51; typecheck/lint PASS; reviewer approved; suíte/build mantêm baselines aceitas fora de escopo.

[x] TASK-051: Implementar ProductCard apenas com dados suportados pelo OpenAPI.
  - Evidência: commits `ea595f3`, `739fdea`, `06d3754` e `5186605`; teste focused 7/7; typecheck/lint PASS; reviewer approved; correção `line-clamp-2` validada em RED/GREEN 7/7 e revisão final atendida; suíte/build mantêm baselines aceitas fora de escopo.

[x] TASK-052: Implementar hero e estrutura da Home sem promoções, descontos ou alegações de frete.
  - Evidência: commit `9353902`; testes focados 14/14; typecheck/lint PASS; reviewer approved.
  - MINOR pendente para composição na TASK-053: adicionar `scroll-margin` à seção `#catalogo` de `HomePage.tsx` sob o header sticky.

[x] TASK-053: Implementar grid do catálogo e iniciar categorias e primeira página em paralelo.
  - Evidência: commit `8179671`; RED 3 falhas; Home 4/4 e catálogo 62/62; typecheck/lint/diff-check PASS; reviewer SPEC+QUALITY approved; `scroll-margin` pendente da TASK-052 resolvido.
  - MINOR pendente sem bloqueio: o `h2` do `ProductCard` achata a hierarquia sob o `h2` Catálogo.

[x] TASK-054: Implementar envio da busca e navegação voltar/avançar baseada na URL.
  - Evidência: commits `0a3a02f` e `85c4290`; RED inicial 5 falhas e regressão de rota filha em RED; testes finais layouts + catálogo 75/75 (root focused 67/67); typecheck/lint/diff PASS; re-review SPEC+QUALITY approved; finding IMPORTANT de busca fora da Home corrigido.

[x] TASK-055: Implementar seleção de categoria e limpeza dos filtros.
  - Evidência: commit `bf36018`; RED 4 falhas; layouts + catálogo 85/85; typecheck/lint/diff PASS; reviewer SPEC+QUALITY approved sem findings; endpoints exclusivos, IDs inválidos e histórico cobertos.

[ ] TASK-056: Implementar paginação, skeleton, estado vazio e retry do catálogo.

[ ] TASK-057: Implementar query de detalhe por `produtoId` com tratamento de `404`.

[ ] TASK-058: Implementar página de produto com título, categoria, modelo, descrição, foto, preço e estoque.

[ ] TASK-059: Integrar QuantityInput ao estoque inteiro disponível e ao estado esgotado.

[ ] TASK-060: Implementar o guard que envia visitantes ao login antes de qualquer inclusão no carrinho.

[x] TASK-061: Implementar o retorno à página de origem após o login sem adicionar item automaticamente.

### Fase 4 — Carrinho autenticado

[ ] TASK-062: Criar o `cartSessionStore` versionado para mapear `clienteId` a `carrinhoId`.

[ ] TASK-063: Criar schemas e adapters dos contratos de carrinho e itens.

[ ] TASK-064: Implementar `POST /api/v1/carrinho/criar` sem body e persistir o ID retornado.

[ ] TASK-065: Implementar `POST /api/v1/carrinho/items` com produto, quantidade e último preço da API.

[ ] TASK-066: Orquestrar criação do carrinho e inclusão do primeiro item como uma única ação de UI.

[ ] TASK-067: Implementar `GET /api/v1/carrinho/{carrinhoId}` e tratar ID ausente.

[ ] TASK-068: Implementar descarte do vínculo local quando a consulta do carrinho retornar `404`.

[ ] TASK-069: Implementar hidratação deduplicada e paralela dos produtos únicos do carrinho.

[ ] TASK-070: Implementar CartItem com imagem, título, preço, quantidade e fallback de produto.

[ ] TASK-071: Implementar página do carrinho com lista, subtotal, total e estado vazio.

[ ] TASK-072: Implementar atualização de quantidade por PATCH com rollback em caso de falha.

[ ] TASK-073: Implementar confirmação e remoção de item por DELETE com rollback em caso de falha.

[ ] TASK-074: Implementar badge do Header derivado do carrinho confirmado.

[ ] TASK-075: Invalidar e atualizar os caches necessários após cada mutação do carrinho.

### Fase 5 — Checkout

[ ] TASK-076: Criar schemas de formulário para endereço de entrega e formas Pix, Cartao e Boleto.

[ ] TASK-077: Impedir acesso ao checkout sem sessão válida ou com carrinho vazio.

[ ] TASK-078: Pré-carregar o endereço do checkout pelo perfil do cliente.

[ ] TASK-079: Implementar a página de checkout com endereço editável apenas para o pedido atual.

[ ] TASK-080: Criar adapter de `CreatePedidoRequest` sem `clienteId` e sem `carrinhoId`.

[ ] TASK-081: Montar os itens do pedido a partir do último estado confirmado do carrinho.

[ ] TASK-082: Implementar `POST /api/v1/pedido` com data ISO gerada no envio.

[ ] TASK-083: Bloquear submissões duplicadas e tratar `409` e `422` no checkout.

[ ] TASK-084: Limpar o vínculo local do carrinho e invalidar pedidos após criação bem-sucedida.

[ ] TASK-085: Implementar página de confirmação com dados retornados em `PedidoCriadoResponse`.

### Fase 6 — Conta do cliente

[ ] TASK-086: Criar schemas e adapters de detalhe, atualização e ID do cliente.

[ ] TASK-087: Implementar query de perfil pelo `clienteId` da sessão.

[ ] TASK-088: Implementar formulário “Meus Dados” com endereço e celular aderentes ao contrato.

[ ] TASK-089: Implementar confirmação específica quando o CPF for alterado.

[ ] TASK-090: Implementar PUT do perfil completo e mapear erros de validação para os campos.

[ ] TASK-091: Implementar invalidação e atualização do cache do perfil após salvar.

[ ] TASK-092: Implementar schema e indicador visual das regras de nova senha.

[ ] TASK-093: Implementar página e mutation de troca de senha.

[ ] TASK-094: Implementar área de perigo e dialog de confirmação para cancelar a conta.

[ ] TASK-095: Implementar DELETE da conta e limpeza integral dos dados privados locais.

### Fase 7 — Pedidos

[ ] TASK-096: Criar schemas e adapters de lista, detalhe, status e cancelamento de pedido.

[ ] TASK-097: Implementar query paginada de pedidos dependente do CPF do perfil.

[ ] TASK-098: Implementar filtros de data inicial e final sincronizados com a URL.

[ ] TASK-099: Implementar OrderCard com status do OpenAPI e total derivado dos itens.

[ ] TASK-100: Implementar página “Meus Pedidos” com paginação, vazio, erro e retry.

[ ] TASK-101: Implementar query e página de detalhe do pedido.

[ ] TASK-102: Hidratar em paralelo os produtos únicos exibidos no detalhe do pedido.

[ ] TASK-103: Implementar ação de cancelamento enviando somente o status `Cancelado`.

[ ] TASK-104: Tratar recusa `422` recarregando o pedido e informando o usuário.

[ ] TASK-105: Invalidar lista e detalhe após cancelamento aceito.

### Fase 8 — Testes e hardening

[ ] TASK-106: Testar schemas e adapters com números em string, dados nulos, enums e contrato inválido.

[ ] TASK-107: Testar formatadores e normalizadores de moeda, CPF, telefone, CEP e datas.

[ ] TASK-108: Testar `authStore`, expiração, escolha de storage e migração de versão.

[ ] TASK-109: Testar `cartSessionStore`, troca de cliente, ID inválido e migração de versão.

[ ] TASK-110: Testar componentes base por teclado, foco, estados e nomes acessíveis.

[ ] TASK-111: Testar integração de login, logout, `401` e retorno seguro com MSW.

[ ] TASK-112: Testar integração de cadastro e perfil com respostas `201`, `409` e `422`.

[ ] TASK-113: Testar integração de catálogo, categoria, busca, paginação e produto `404` com MSW.

[ ] TASK-114: Testar criação, leitura, atualização, remoção e rollback do carrinho com MSW.

[ ] TASK-115: Testar checkout e criação de pedido sem `clienteId` e `carrinhoId` no payload.

[ ] TASK-116: Testar lista, detalhe e cancelamento recusado de pedido com MSW.

[ ] TASK-117: Criar E2E de cadastro, login, rota protegida e logout.

[ ] TASK-118: Criar E2E de visitante redirecionado ao login antes de adicionar um produto.

[ ] TASK-119: Criar E2E de adicionar, alterar quantidade e remover item do carrinho.

[ ] TASK-120: Criar E2E de carrinho, checkout e confirmação do pedido.

[ ] TASK-121: Criar E2E de edição de dados e troca de senha.

[ ] TASK-122: Criar E2E de consulta, detalhe e tentativa de cancelamento de pedido.

[ ] TASK-123: Criar E2E de sessão expirada durante acesso protegido.

[ ] TASK-124: Aplicar lazy loading às rotas de checkout, conta e pedidos.

[ ] TASK-125: Auditar waterfalls, deduplicação de produtos, re-renderizações e imports que ampliem o bundle.

[ ] TASK-126: Auditar persistência local, remoção de dados privados e ausência de logs sensíveis.

[ ] TASK-127: Auditar responsividade entre 320 px e desktop amplo sem overflow horizontal.

[ ] TASK-128: Auditar navegação por teclado, foco, contraste, regiões vivas e movimento reduzido.

[ ] TASK-129: Documentar instalação, variáveis de ambiente, scripts e execução integrada no README do frontend.

[ ] TASK-130: Executar typecheck, lint, testes, E2E e build como gate final do MVP.


