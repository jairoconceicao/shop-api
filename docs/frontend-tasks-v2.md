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

[x] TASK-056: Implementar paginação, skeleton, estado vazio e retry do catálogo.
  - Evidência: commit `af04e6c`; RED 6 falhas; Home 19/19 e layouts + catálogo 94/94; typecheck/lint/diff PASS; reviewer SPEC+QUALITY approved sem findings.
  - Build FAIL por baseline preexistente em `main.tsx` (`top-level await` em `enableMocking`), confirmado no BASE e fora do diff; dívida separada.

[x] TASK-057: Implementar query de detalhe por `produtoId` com tratamento de `404`.
  - Evidência: commits `3afa6f2` e `f0c7b1d`; RED por módulos ausentes e regressão de query inválida; focused 17/17 e catálogo 94/94; typecheck/lint/diff PASS; re-review SPEC+QUALITY approved; finding IMPORTANT do sentinel `/produto/0` corrigido.

[x] TASK-058: Implementar página de produto com título, categoria, modelo, descrição, foto, preço e estoque.
  - Evidência: commit `6a1d63b`; RED por módulo/página ausente; focused 20/20 e page + App + catálogo 114/114; typecheck/lint/diff PASS; reviewer SPEC approved e QUALITY approved com MINOR; finding MINOR pendente: estado de erro recuperável usa `h2` em `ErrorState`, sem `h1` de página.

[x] TASK-059: Integrar QuantityInput ao estoque inteiro disponível e ao estado esgotado.
  - Evidência: commits `d69af40` e `1ff33d3`; focused 19/19 (root page 15/15), catálogo + App 121/121; typecheck/lint/diff PASS; re-review SPEC+QUALITY approved; finding IMPORTANT de `setState` durante render corrigido com reducer/effect.

[x] TASK-060: Implementar o guard que envia visitantes ao login antes de qualquer inclusão no carrinho.
  - Evidência: commit `6d5212e`; RED 2 falhas de redirect; focused 36/36; ampla 145/146 com única baseline temporal preexistente em `authStore` autorizada; typecheck/lint/diff PASS; reviewer SPEC+QUALITY approved sem findings; zero cart request/persistence/auto-add.

[x] TASK-061: Implementar o retorno à página de origem após o login sem adicionar item automaticamente.
  - Evidência: commit `011804d`; App 13/13 e App + ProductDetailPage + LoginPage 37/37; typecheck/lint/build/diff-check PASS; reviewer SPEC+QUALITY approved sem findings; zero inclusão automática no carrinho.

### Fase 4 — Carrinho autenticado

[x] TASK-062: Criar o `cartSessionStore` versionado para mapear `clienteId` a `carrinhoId`.
  - Status: DONE
  - Depends on: TASK-061
  - Critérios de aceite:
    - Persistir somente o vínculo `clienteId` → `carrinhoId`, com versão e migração explícitas, sem duplicar dados do carrinho remoto.
    - Permitir consultar, definir e remover o vínculo de um cliente sem afetar os demais; logout pode conservá-lo.
    - Cobrir restauração, migração e remoção seletiva com testes do store.
  - Evidência: commits `837416f` e `730291f`; focused 10/10 e ampla 324/324; typecheck/lint/build/diff-check PASS; reviewer SPEC+QUALITY approved sem findings.

[x] TASK-063: Criar schemas e adapters dos contratos de carrinho e itens.
  - Status: DONE
  - Depends on: TASK-061
  - Critérios de aceite:
    - Validar os envelopes e dados de criação, leitura, inclusão, atualização e remoção definidos no `openapi.yaml`.
    - Normalizar IDs, quantidades e valores recebidos como `number | string` sem acrescentar campos ausentes do contrato.
    - Rejeitar respostas inválidas com erro de contrato e cobrir casos válidos e inválidos por testes.
  - Evidência: commit `7c6a5b0`; focused 23/23 e ampla 347/347; typecheck/lint/build/diff-check PASS; reviewer SPEC+QUALITY approved.
  - Finding pendente: MINOR — ampliar a cobertura explícita de IDs unsafe e números não finitos para todos os campos numéricos na revisão final.

[x] TASK-064: Implementar `POST /api/v1/carrinho/criar` sem body e persistir o ID retornado.
  - Status: DONE
  - Depends on: TASK-062, TASK-063
  - Critérios de aceite:
    - Enviar a requisição autenticada sem body e validar a resposta de criação.
    - Associar o `carrinhoId` retornado ao `clienteId` autenticado somente após resposta bem-sucedida.
    - Não repetir automaticamente a mutação nem persistir vínculo em caso de falha.
  - Evidência: commit `89d9f84`; focused 6/6 e ampla 353/353; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-065: Implementar `POST /api/v1/carrinho/items` com produto, quantidade e último preço da API.
  - Status: DONE
  - Depends on: TASK-059, TASK-063
  - Critérios de aceite:
    - Enviar exatamente `produtoId`, `quantidade` e `valorUnitario` conforme o contrato.
    - Revalidar o detalhe do produto imediatamente antes da inclusão, usar exclusivamente o preço retornado nessa consulta e tratar mudança ou conflito de preço de forma acionável, reconhecendo o backend como autoridade final e sem recuperar intenção persistida antes do login.
    - Não repetir automaticamente a inclusão e apresentar erro acionável quando ela falhar.
  - Evidência: commit `0e5c0e9`; focused 10/10 e ampla 363/363; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-066: Orquestrar criação do carrinho e inclusão do primeiro item como uma única ação de UI.
  - Status: DONE
  - Depends on: TASK-064, TASK-065
  - Critérios de aceite:
    - Uma confirmação explícita em “Adicionar” deve reutilizar o vínculo existente ou executar criação → inclusão na ordem correta.
    - Impedir submissões concorrentes da mesma ação e informar sucesso somente após a inclusão confirmada.
    - Não criar carrinho, persistir item ou concluir inclusão automaticamente no retorno do login.
  - Evidência: commit `ececf8d`; focused 54/54 e ampla 372/372; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings bloqueantes.
  - Finding pendente: MINOR — ampliar a cobertura explícita para troca de sessão durante o fluxo, retorno pós-login, ciclo de preço alterado e asserts diretos das mutations.

[x] TASK-067: Implementar `GET /api/v1/carrinho/{carrinhoId}` e tratar ID ausente.
  - Status: DONE
  - Depends on: TASK-062, TASK-063
  - Critérios de aceite:
    - Consultar o carrinho autenticado pelo ID associado ao cliente e manter a resposta completa no TanStack Query.
    - Com ID ausente, representar carrinho vazio sem emitir requisição com ID sentinela ou inválido.
    - Oferecer retry manual para falhas recuperáveis da consulta.
  - Evidência: commits `5ed23a0` e `d5dee59`; focused 14/14 e ampla 386/386; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-068: Implementar descarte do vínculo local quando a consulta do carrinho retornar `404`.
  - Status: DONE
  - Depends on: TASK-067
  - Critérios de aceite:
    - Remover somente o vínculo do cliente autenticado quando a leitura do carrinho conhecido retornar `404`.
    - Atualizar a UI para o estado sem carrinho e permitir que a próxima inclusão crie outro carrinho.
    - Não descartar o vínculo em erros de rede ou outros status HTTP.
  - Evidência: commit `34088a5`; focused 17/17 e ampla 393/393; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-069: Implementar hidratação deduplicada e paralela dos produtos únicos do carrinho.
  - Status: DONE
  - Depends on: TASK-057, TASK-067
  - Critérios de aceite:
    - Deduplicar os `produtoId` dos itens e hidratar os produtos únicos em paralelo com `Promise.all`.
    - Reutilizar o cache de detalhe por `produtoId`, sem armazenar produtos ou itens no Zustand.
    - Isolar falhas por produto para que um detalhe indisponível não impeça a exibição dos demais itens.
  - Evidência: commits `8a1a746` e `273a99c`; focused 7/7 e ampla 400/400; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-070: Implementar CartItem com imagem, título, preço, quantidade e fallback de produto.
  - Status: DONE
  - Depends on: TASK-026, TASK-063, TASK-069
  - Critérios de aceite:
    - Exibir imagem, título e dados hidratados do produto junto ao preço e à quantidade confirmados no item do carrinho.
    - Reservar espaço de imagem, manter nome acessível e reorganizar conteúdo e ações para uma coluna em telas pequenas.
    - Exibir fallback acionável quando o produto não puder ser hidratado, sem ocultar nem quebrar os demais itens.
  - Evidência: commits `8e25d9c` e `a3e76fe`; focused 3/3 e ampla 403/403; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings. A primeira execução ampla apresentou flake preexistente em `useLogoutMutation.test.tsx`, e a repetição completa passou com 403/403.

[x] TASK-071: Implementar página do carrinho com lista, subtotal, total e estado vazio.
  - Status: DONE
  - Depends on: TASK-068, TASK-070
  - Critérios de aceite:
    - Proteger `/carrinho` e renderizar os itens confirmados com estados de carregamento e erro recuperável.
    - Calcular subtotal a partir dos itens e exibir total equivalente, sem frete, descontos ou valores inventados.
    - Exibir estado vazio com link para o catálogo quando não houver carrinho ou itens.
  - Evidência: commits `b93df6d` e `b44f603`; focused 19/19 e ampla 409/409; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings após correção do landmark principal duplicado.

[x] TASK-072: Implementar atualização de quantidade por PATCH com rollback em caso de falha.
  - Status: DONE
  - Depends on: TASK-071
  - Critérios de aceite:
    - Enviar `PATCH /api/v1/carrinho/items/{itemId}` com a quantidade válida selecionada.
    - Refletir a alteração de forma otimista e restaurar o último carrinho confirmado se a mutação falhar.
    - Apresentar erro acionável e não repetir automaticamente a mutação.
  - Evidência: commit `aead2aa`; focused 15/15 (service + mutation 5/5 e página 10/10) e ampla 418/418; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings. A primeira execução ampla apresentou o flake preexistente em `useLogoutMutation.test.tsx` (417/418); o teste isolado passou 2/2 e a repetição completa passou 418/418.

[x] TASK-073: Implementar confirmação e remoção de item por DELETE com rollback em caso de falha.
  - Status: DONE
  - Depends on: TASK-071
  - Critérios de aceite:
    - Exigir confirmação acessível antes de chamar `DELETE /api/v1/carrinho/items/{itemId}`.
    - Refletir a remoção de forma otimista e restaurar o último carrinho confirmado se a mutação falhar.
    - Apresentar erro acionável e não repetir automaticamente a mutação.
  - Evidência: commit `2ebb07d`; focused 20/20 e ampla 428/428; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-074: Implementar badge do Header derivado do carrinho confirmado.
  - Status: DONE
  - Depends on: TASK-027, TASK-067
  - Critérios de aceite:
    - Derivar o badge da soma das quantidades do último carrinho confirmado pelo backend.
    - Exibir zero ou ocultar o contador quando não houver carrinho confirmado, sem usar estado otimista ou duplicado no Zustand.
    - Atualizar o valor de forma acessível sem provocar recarga completa da SPA.
  - Evidência: commits `7fe1863` e `ef5d3a7`; focused 29/29 (revisor) e ampla 441/441; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings após correções do snapshot confirmado em mount pendente e do escopo por cliente/carrinho. A primeira execução ampla apresentou o flake preexistente em `useLogoutMutation.test.tsx` (435/436), e as repetições completas passaram com 436/436 e, após as correções, 441/441.

[x] TASK-075: Invalidar e atualizar os caches necessários após cada mutação do carrinho.
  - Status: DONE
  - Depends on: TASK-064, TASK-065, TASK-072, TASK-073, TASK-074
  - Critérios de aceite:
    - Manter uma estratégia única de query keys para reconciliar criação, inclusão, atualização e remoção com o carrinho confirmado.
    - Atualizar ou invalidar os caches afetados após sucesso, incluindo lista, resumo e badge, sem duplicar respostas completas em stores locais.
    - Preservar o rollback das mutações e cobrir a convergência do cache com testes de integração.
  - Evidência: commits `0f8bf44`, `625ebc5` e `01decb1`; focused 28/28 (revisor) e ampla 451/451; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT após a serialização das mutações por item e o bloqueio cruzado da UI. A primeira execução ampla apresentou o flake preexistente em `useLogoutMutation.test.tsx` (450/451); o teste isolado passou 2/2 e a repetição completa passou 451/451.

### Fase 5 — Checkout

[ ] TASK-076: Criar schemas de formulário para endereço de entrega e formas Pix, Cartao e Boleto.
  - Status: READY
  - Depends on: TASK-075
  - Critérios de aceite:
    - Validar os sete campos do endereço de entrega (`logradouro`, `numero`, `complemento`, `cep`, `bairro`, `cidade` e `uf`) antes da confirmação.
    - Aceitar exatamente `Pix`, `Cartao` e `Boleto` como formas de pagamento.
    - Rejeitar valores ou propriedades fora do contrato com testes unitários do schema.

[ ] TASK-077: Impedir acesso ao checkout sem sessão válida ou com carrinho vazio.
  - Status: READY
  - Depends on: TASK-076
  - Critérios de aceite:
    - Manter `/checkout` sob a proteção de sessão existente e preservar o retorno seguro ao login.
    - Redirecionar carrinho inexistente ou confirmado sem itens para `/carrinho` sem renderizar o formulário.
    - Exibir estado de carregamento ou erro enquanto o último carrinho confirmado ainda não permite decidir o acesso.

[ ] TASK-078: Pré-carregar o endereço do checkout pelo perfil do cliente.
  - Status: READY
  - Depends on: TASK-077
  - Critérios de aceite:
    - Consultar `GET /api/v1/cliente/{clienteId}` com o token e o `clienteId` da sessão válida.
    - Adaptar o endereço retornado para os valores iniciais do formulário sem alterar o perfil persistido.
    - Apresentar carregamento e erro acionável quando a pré-carga não puder ser concluída.

[ ] TASK-079: Implementar a página de checkout com endereço editável apenas para o pedido atual.
  - Status: READY
  - Depends on: TASK-078
  - Critérios de aceite:
    - Renderizar resumo do carrinho, endereço editável e seleção acessível de `Pix`, `Cartao` ou `Boleto` em desktop e mobile.
    - Manter edições do endereço somente no estado do formulário de checkout, sem chamar endpoint de atualização do cliente.
    - Exibir validações por campo e resumo de erros antes de permitir a confirmação.

[ ] TASK-080: Criar adapter de `CreatePedidoRequest` sem `clienteId` e sem `carrinhoId`.
  - Status: READY
  - Depends on: TASK-079
  - Critérios de aceite:
    - Produzir somente `enderecoEntrega`, `formaPagamento`, `dataPedido` e `items` no nível raiz.
    - Rejeitar `clienteId`, `carrinhoId` e demais propriedades raiz desconhecidas.
    - Preservar em cada item `itemId`, `produtoId`, `quantidade` e `valorUnitario` conforme o contrato da API.

[ ] TASK-081: Montar os itens do pedido a partir do último estado confirmado do carrinho.
  - Status: READY
  - Depends on: TASK-080
  - Critérios de aceite:
    - Mapear os itens exclusivamente do dado confirmado da query do carrinho, sem usar valores otimistas ou dados visuais hidratados.
    - Preservar `itemId`, `produtoId`, `quantidade` e `valorUnitario` de cada item confirmado.
    - Impedir a montagem quando o carrinho confirmado estiver ausente ou vazio.

[ ] TASK-082: Implementar `POST /api/v1/pedido` com data ISO gerada no envio.
  - Status: READY
  - Depends on: TASK-081
  - Critérios de aceite:
    - Enviar `POST /api/v1/pedido` autenticado com o request produzido pelo adapter estrito.
    - Gerar `dataPedido` por `new Date().toISOString()` no instante de cada confirmação, e não na abertura da página.
    - Adaptar a resposta `201` para `PedidoCriadoResponse` e cobrir request e response em testes de serviço.

[ ] TASK-083: Bloquear submissões duplicadas e tratar `409` e `422` no checkout.
  - Status: READY
  - Depends on: TASK-082
  - Critérios de aceite:
    - Desabilitar o CTA e ignorar nova confirmação enquanto a mutação estiver pendente.
    - Apresentar mensagens acionáveis para conflitos `409` e validações `422`, preservando os dados editados.
    - Reabilitar a confirmação após falha sem disparar mais de uma requisição por tentativa.

[ ] TASK-084: Limpar o vínculo local do carrinho e invalidar pedidos após criação bem-sucedida.
  - Status: READY
  - Depends on: TASK-083
  - Critérios de aceite:
    - Remover o `carrinhoId` somente do cliente autenticado após resposta `201` adaptada com sucesso.
    - Invalidar os caches de pedidos e remover os caches do carrinho concluído antes de navegar.
    - Não limpar vínculo nem caches de sucesso quando a criação falhar.

[ ] TASK-085: Implementar página de confirmação com dados retornados em `PedidoCriadoResponse`.
  - Status: READY
  - Depends on: TASK-084
  - Critérios de aceite:
    - Abrir `/pedido-confirmado/{pedidoId}` após `201` e exibir identificador, data, forma de pagamento, status e valor total retornados.
    - Preservar apenas a resposta de confirmação em `sessionStorage` para restaurar a mesma confirmação após refresh da rota, validando o `pedidoId` da URL.
    - Usar texto neutro de pedido criado, sem alegar autorização do pagamento, entrega ou emissão de nota fiscal.

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


