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

[x] TASK-076: Criar schemas de formulário para endereço de entrega e formas Pix, Cartao e Boleto.
  - Status: DONE
  - Depends on: TASK-075
  - Critérios de aceite:
    - Validar os sete campos do endereço de entrega (`logradouro`, `numero`, `complemento`, `cep`, `bairro`, `cidade` e `uf`) antes da confirmação.
    - Aceitar exatamente `Pix`, `Cartao` e `Boleto` como formas de pagamento.
    - Rejeitar valores ou propriedades fora do contrato com testes unitários do schema.
  - Evidência: commits `8ab6a88`, `53ca4f7` e `bb071ac`; RED confirmado pelo comportamento anterior e GREEN focado 18/18; suíte 469/469; typecheck/lint/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-077: Impedir acesso ao checkout sem sessão válida ou com carrinho vazio.
  - Status: DONE
  - Depends on: TASK-076
  - Critérios de aceite:
    - Manter `/checkout` sob a proteção de sessão existente e preservar o retorno seguro ao login.
    - Redirecionar carrinho inexistente ou confirmado sem itens para `/carrinho` sem renderizar o formulário.
    - Exibir estado de carregamento ou erro enquanto o último carrinho confirmado ainda não permite decidir o acesso.
  - Evidência: commits `ddf45bb` e `05d883c`; RED confirmado pela ausência inicial do `CheckoutGuard`; testes focados e de integração 19/19; suíte 475/475; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-078: Pré-carregar o endereço do checkout pelo perfil do cliente.
  - Status: DONE
  - Depends on: TASK-077
  - Critérios de aceite:
    - Consultar `GET /api/v1/cliente/{clienteId}` com o token e o `clienteId` da sessão válida.
    - Adaptar o endereço retornado para os valores iniciais do formulário sem alterar o perfil persistido.
    - Apresentar carregamento e erro acionável quando a pré-carga não puder ser concluída.
  - Evidência: commits `3687a67`, `e841dc4` e `91c11c2`; RED confirmado por módulos ausentes e 6 falhas comportamentais de integração; testes focados e de integração 42/42; suíte 498/498; typecheck/lint/build/diff-check PASS; reviewer aprovado nos dois gates sem findings.

[x] TASK-079: Implementar a página de checkout com endereço editável apenas para o pedido atual.
  - Status: DONE
  - Depends on: TASK-078
  - Critérios de aceite:
    - Renderizar resumo do carrinho, endereço editável e seleção acessível de `Pix`, `Cartao` ou `Boleto` em desktop e mobile.
    - Manter edições do endereço somente no estado do formulário de checkout, sem chamar endpoint de atualização do cliente.
    - Exibir validações por campo e resumo de erros antes de permitir a confirmação.
  - Evidência: commits `0d29796`, `e82753d` e `89cf1f9`; RED confirmado por módulo ausente e por 2 falhas esperadas de acessibilidade/composição; testes focados 12/12 e de integração 16/16; suíte 503/503 (uma execução anterior expôs flake preexistente com 500/501, seguido pelo teste isolado 2/2 e rerun completo 501/501); typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-080: Criar adapter de `CreatePedidoRequest` sem `clienteId` e sem `carrinhoId`.
  - Status: DONE
  - Depends on: TASK-079
  - Critérios de aceite:
    - Produzir somente `enderecoEntrega`, `formaPagamento`, `dataPedido` e `items` no nível raiz.
    - Rejeitar `clienteId`, `carrinhoId` e demais propriedades raiz desconhecidas.
    - Preservar em cada item `itemId`, `produtoId`, `quantidade` e `valorUnitario` conforme o contrato da API.
  - Evidência: commits `c80418f` e `9c1545d`; RED confirmado por módulo ausente; teste focado 10/10; suíte ampla 513/513; typecheck/lint/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-081: Montar os itens do pedido a partir do último estado confirmado do carrinho.
  - Status: DONE
  - Depends on: TASK-080
  - Critérios de aceite:
    - Mapear os itens exclusivamente do dado confirmado da query do carrinho, sem usar valores otimistas ou dados visuais hidratados.
    - Preservar `itemId`, `produtoId`, `quantidade` e `valorUnitario` de cada item confirmado.
    - Impedir a montagem quando o carrinho confirmado estiver ausente ou vazio.
  - Evidência: commits `c42cb6f` e `4c2f462`; RED confirmado por módulo ausente; teste focado 4/4; suíte ampla 517/517; typecheck/lint/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-082: Implementar `POST /api/v1/pedido` com data ISO gerada no envio.
  - Status: DONE
  - Depends on: TASK-081
  - Critérios de aceite:
    - Enviar `POST /api/v1/pedido` autenticado com o request produzido pelo adapter estrito.
    - Gerar `dataPedido` por `new Date().toISOString()` no instante de cada confirmação, e não na abertura da página.
    - Adaptar a resposta `201` para `PedidoCriadoResponse` e cobrir request e response em testes de serviço.
  - Evidência: commits `d1d102c` e `90ce4a9`; RED confirmado por módulo ausente; teste focado do serviço 4/4 e revisão agregada 18/18; suíte ampla 521/521; typecheck/lint/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-083: Bloquear submissões duplicadas e tratar `409` e `422` no checkout.
  - Status: DONE
  - Depends on: TASK-082
  - Critérios de aceite:
    - Desabilitar o CTA e ignorar nova confirmação enquanto a mutação estiver pendente.
    - Apresentar mensagens acionáveis para conflitos `409` e validações `422`, preservando os dados editados.
    - Reabilitar a confirmação após falha sem disparar mais de uma requisição por tentativa.
  - Evidência: commits `2aa3c1d`, `b4b3052` e `596e00f`; RED confirmado por módulo ausente, CTA ainda habilitado, ausência de alertas acionáveis, segunda requisição após `201` e mutation privada retida no logout; testes focados 12/12; suíte ampla 528/528; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-084: Limpar o vínculo local do carrinho e invalidar pedidos após criação bem-sucedida.
  - Status: DONE
  - Depends on: TASK-083
  - Critérios de aceite:
    - Remover o `carrinhoId` somente do cliente autenticado após resposta `201` adaptada com sucesso.
    - Invalidar os caches de pedidos e remover os caches do carrinho concluído antes de navegar.
    - Não limpar vínculo nem caches de sucesso quando a criação falhar.
  - Evidência: commits `27e8557`, `20b9864`, `0cdae32`, `3f2fdc4` e `c649c8a`; RED confirmado por namespace de pedidos ausente, vínculo concorrente removido pelo sucesso tardio e respostas obsoletas ainda alcançando callbacks locais; testes focados originais 6/6 e correção final 22/22; suíte ampla original 532/532 e final 549/549 (uma execução expôs o flake preexistente em `useLogoutMutation.test.tsx` com 548/549, o teste isolado passou 2/2 e o rerun completo passou 549/549); typecheck/lint/build/e2e-list/diff-check PASS; revisão ampla final aprovada sem findings CRITICAL ou IMPORTANT.

[x] TASK-085: Implementar página de confirmação com dados retornados em `PedidoCriadoResponse`.
  - Status: DONE
  - Depends on: TASK-084
  - Critérios de aceite:
    - Abrir `/pedido-confirmado/{pedidoId}` após `201` e exibir identificador, data, forma de pagamento, status e valor total retornados.
    - Exibir os dados somente a partir do state/cache privado em memória e, após refresh, mostrar estado de confirmação indisponível com ação para voltar à loja.
    - Usar texto neutro de pedido criado, sem alegar autorização do pagamento, entrega ou emissão de nota fiscal.
  - Evidência: commits `5344ea1`, `ad4fe90`, `a7dd868`, `5dd1ee0` e `7e3ff1a`; RED confirmou módulos e rota ausentes, exposição via navigation state, reutilização cross-session e carregamento estático do checkout; testes focados 30/30 na revisão funcional (28/28 na suíte do implementador antes da re-review), lazy routing integrado 32/32 e suíte ampla final 549/549; typecheck/lint/build/e2e-list/diff-check PASS; build confirmou chunks lazy separados `CheckoutPage-*.js` e `OrderConfirmationPage-*.js` fora do entry; revisão ampla final aprovada sem findings CRITICAL ou IMPORTANT.

### Fase 6 — Conta do cliente

[x] TASK-086: Criar schemas e adapters de detalhe, atualização e ID do cliente.
  - Status: DONE
  - Depends on: TASK-085
  - Critérios de aceite:
    - Validar o perfil completo e respostas por ID com Zod, normalizando `clienteId` recebido como `number | string` para inteiro positivo e rejeitando envelope nulo, status falso e ID divergente.
    - Montar um `UpdateClienteRequest` estrito, sem `clienteId`, senha ou propriedades extras, normalizando CPF, DDD, textos, UF e complemento vazio conforme o contrato.
    - Substituir o contrato parcial do checkout pelo contrato canônico de `features/customer`, preservando apenas a projeção local do endereço e sem criar uma segunda validação de `GET /api/v1/cliente/{clienteId}`.
  - Evidência: commits `091d875` e `32e938d`; RED regressivo confirmou a projeção de CEP curto sem validação; testes focados 39/39 e regressões do checkout 30/30; suíte ampla 559/559; typecheck/lint/build PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-087: Implementar query de perfil pelo `clienteId` da sessão.
  - Status: DONE
  - Depends on: TASK-086
  - Critérios de aceite:
    - Chamar `GET /api/v1/cliente/{clienteId}` com Bearer token e `AbortSignal` somente quando a sessão contiver token e `clienteId` válidos.
    - Usar a chave `['private', 'customer', 'detail', customerId]` com `meta.private: true`, sem token ou CPF na chave e sem copiar o perfil para Zustand ou storage.
    - Isolar trocas de cliente por chave e sessão capturadas, impedindo que resposta tardia de outra sessão altere o perfil visível; o checkout reutiliza essas mesmas options.
  - Evidência: commit `658d296`; RED confirmou os módulos canônicos ausentes e o `CheckoutGuard` ainda dependente do hook antigo; testes focados 32/32, regressão de troca de sessão 7/7 e suíte ampla 558/558; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.
  - Finding pendente (MINOR): o teste parametrizado de `refetch` usa uma sessão válida e cobre `enabled=false`, mas não exercita o `refetch` para cada combinação inválida de ID/token.

[x] TASK-088: Implementar formulário “Meus Dados” com endereço e celular aderentes ao contrato.
  - Status: DONE
  - Depends on: TASK-087
  - Critérios de aceite:
    - Carregar `/minha-conta/dados` em chunk lazy e exibir skeleton sem salto, erro com retry manual e formulário somente após um perfil válido.
    - Expor CPF, nome, nascimento, e-mail, endereço com logradouro/número/complemento separados, CEP, bairro, cidade, UF, DDD, celular e WhatsApp, com labels visíveis e validação local antes da rede.
    - Manter edição no React Hook Form, sem sobrescrever campos sujos em refetch, funcionando entre 320 px e 1920 px sem rolagem horizontal e com erros associados por `aria-describedby`.
  - Evidência: commits `c2bea3e`, `53c7886` e `3678b92`; RED inicial confirmou a ausência da página e a rota ainda ligada ao placeholder, e as regressões UTC confirmaram o limite de nascimento incorreto na virada da data civil local; o helper de data civil local foi compartilhado entre formulário e schemas; testes focados 9/9 e suíte ampla 566/566; typecheck/lint/build/diff-check PASS; build confirmou `CustomerDataPage` em chunk separado; reviewer aprovado sem findings CRITICAL ou IMPORTANT. Uma execução ampla observou flake preexistente no teste de logout, que passou isolado 2/2 e no rerun amplo 566/566.

[x] TASK-089: Implementar confirmação específica quando o CPF for alterado.
  - Status: DONE
  - Depends on: TASK-088
  - Critérios de aceite:
    - Interromper o submit somente quando o CPF normalizado diferir do snapshot confirmado e mostrar CPF anterior e novo mascarados em dialog nomeado e descrito.
    - Confirmar exatamente o request completo já validado; cancelar ou pressionar Escape não envia nada e restaura o foco ao acionador.
    - Não abrir o dialog para alterações de outros campos nem permitir confirmação duplicada enquanto o envio estiver pendente.
  - Evidência: commit `2caf699`; RED confirmou a ausência do gate e do dialog de confirmação de CPF; testes focados 11/11 e suíte ampla 570/570; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT. Finding MINOR pendente: o teste integrado valida o shape do request, mas não sua identidade por referência estrita, e cobre cancelamento integrado por Escape, mas não por botão ou backdrop.

[x] TASK-090: Implementar PUT do perfil completo e mapear erros de validação para os campos.
  - Status: DONE
  - Depends on: TASK-089
  - Critérios de aceite:
    - Enviar o request completo por `PUT /api/v1/cliente/{clienteId}` com o token e cliente capturados na tentativa, `retry: false` e bloqueio de submissão duplicada.
    - Aceitar sucesso somente quando o envelope retornar o mesmo `clienteId`; falhas de contrato, rede, `404`, `409` ou `5xx` preservam os valores do formulário e oferecem retorno acionável.
    - Mapear notificações `422` conhecidas, inclusive caminhos de `Endereco` e `Celular`, aos campos; propriedades desconhecidas vão ao resumo geral, e `401`/`403` seguem os comportamentos globais definidos.
  - Evidência: commits `9c555ae`, `3c2b05c` e `29d18b6`; RED inicial confirmou ausência do PUT/mutation/mapper, RED de revisão confirmou perda de múltiplos erros gerais e RED final reproduziu feedback de sucesso obsoleto após falha na confirmação de CPF; focused 11/11, feature customer 72/72 e suíte completa 581/581; typecheck/lint/build/diff-check PASS; reviewer aprovado após correções sem findings CRITICAL ou IMPORTANT.

[x] TASK-091: Implementar invalidação e atualização do cache do perfil após salvar.
  - Status: DONE
  - Depends on: TASK-090
  - Critérios de aceite:
    - Após resposta válida da mesma sessão, gravar na chave exata o perfil completo enviado com `customerId` preservado e invalidar essa chave para reconciliação.
    - Atualizar o snapshot do formulário após salvar, inclusive o CPF de referência, sem atualização otimista e sem sobrescrever edições sujas por refetch.
    - Ignorar callbacks tardios quando a sessão já representar outro cliente e manter checkout e tela de dados observando o mesmo cache canônico.
  - Evidência: commits `2ca697c`, `2f0cb34` e `3678b92`; RED inicial confirmou retorno incompleto, ausência de atualização/invalidação canônica, aceitação de respostas tardias e CPF salvo fora do novo snapshot; RED de revisão confirmou resolução precoce durante invalidação pendente e, na revisão ampla, que a rejeição da reconciliação convertia o ACK do PUT em falha; a chave canônica permanece confirmada e `invalidateQueries` continua aguardado em best-effort, sem retry ou segundo PUT; testes focados 31/31 e suíte completa 590/590; typecheck/lint/build/diff-check PASS; reviewer aprovado após correção sem findings CRITICAL ou IMPORTANT.

[x] TASK-092: Implementar schema e indicador visual das regras de nova senha.
  - Status: DONE
  - Depends on: TASK-091
  - Critérios de aceite:
    - Validar request estrito contendo apenas `senhaAtual` obrigatória e `senhaNova` com oito caracteres, uma maiúscula, um número e um caractere de `!@#$%`, sem aparar valores.
    - Exibir permanentemente as quatro regras ao lado da nova senha e recalcular cada estado durante a digitação com texto/semântica, sem depender somente de cor.
    - Cobrir por testes todas as regras isoladas e combinadas, propriedades extras e garantir que senhas não sejam persistidas nem registradas.
  - Evidência: commit `a0b69dc`; RED confirmou falha dos dois testes focados pela ausência dos módulos; testes focados 17/17 e suíte completa 607/607; typecheck/lint/build/diff-check PASS; auditoria explícita não encontrou uso de storage ou logging; reviewer aprovado sem findings CRITICAL ou IMPORTANT, com nota MINOR para ampliar o caso negativo de caractere especial fora de `!@#$%`.

[x] TASK-093: Implementar página e mutation de troca de senha.
  - Status: DONE
  - Depends on: TASK-092
  - Critérios de aceite:
    - Carregar `/minha-conta/senha` em chunk lazy e enviar `senhaAtual` e `senhaNova` por `PUT /api/v1/cliente/{clienteId}/senha` com Bearer token, `retry: false` e proteção contra duplicidade.
    - Mapear `422` conhecido para os campos e demais falhas para o resumo; após sucesso com ID correspondente, limpar ambas as senhas, focar a confirmação e anunciá-la em região viva.
    - Capturar cliente e token por tentativa, ignorar sucesso tardio de outra sessão e manter senhas exclusivamente no formulário durante sucesso ou falha.
  - Evidência: commits `9e622bb`, `507a222` e `56575a7`; RED inicial confirmou ausência de service, mutation, página e rota lazy; RED da revisão confirmou perda do erro remoto de `SenhaNova` após limpeza e ausência de associação acessível com a lista de regras; a revisão ampla confirmou retenção das senhas nas variables do MutationCache, corrigida com identificador opaco e armazenamento efêmero limpo em `finally` após sucesso ou falha; testes focados 7/7 e suíte completa 618/618; typecheck/lint/build/diff-check PASS; chunk lazy separado validado; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-094: Implementar área de perigo e dialog de confirmação para cancelar a conta.
  - Status: DONE
  - Depends on: TASK-093
  - Critérios de aceite:
    - Exibir em “Meus Dados” uma área de perigo visualmente distinta com consequências explícitas, sem executar cancelamento por clique único.
    - Exigir checkbox de confirmação antes de habilitar a ação destrutiva; “Voltar” e Escape fecham sem efeito e a ação segura recebe o foco inicial.
    - Fornecer dialog acessível por teclado, com nome, descrição, foco preso/restaurado e estado pendente que impeça fechamento destrutivo ou segundo envio.
  - Evidência: commits `b1cd820`, `ee0c418` e `1c26508`; RED inicial confirmou ausência do componente e da área como irmã do formulário; RED da revisão reproduziu liberação precoce do latch após callback síncrono, rejeição não tratada e botão de fechar semanticamente ativo durante estado pendente; a revisão ampla confirmou que `Dialog.closeDisabled` não bloqueava Escape/backdrop internamente e que o dialog de CPF não propagava `pending`, ambos corrigidos com cobertura semântica; testes focados 21/21 e suíte completa 624/624; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-095: Implementar DELETE da conta e limpeza integral dos dados privados locais.
  - Status: DONE
  - Depends on: TASK-094
  - Critérios de aceite:
    - Chamar `DELETE /api/v1/cliente/{clienteId}` sem body, com Bearer token e `retry: false`, iniciando efeitos somente após resposta válida com o mesmo ID e sessão ainda correspondente.
    - Remover, na ordem definida, apenas o vínculo de carrinho do cliente cancelado, a sessão persistida, queries e mutations `meta.private: true` e snapshots privados transitórios; vínculos de outros clientes permanecem.
    - Redirecionar com `replace` para rota pública e confirmação neutra sem dados pessoais; qualquer falha mantém sessão, vínculo, formulário e dialog utilizáveis sem limpeza parcial.
  - Evidência: commits `88fdc7f` e `cb32828`; RED inicial confirmou ausência do service DELETE, registro de snapshots transitórios e mutation, e RED da revisão reproduziu o segundo ciclo de mutation que desbloqueava a UI durante o DELETE original e a ausência do rótulo exato “Tentar novamente”; testes focados 23/23 e suíte completa 634/634; typecheck/lint/build/e2e-list/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT. Decisão registrada: respostas `401` mantêm o logout global conforme o design aprovado; falhas de rede, contrato, `403`, `404`, `422` e `5xx` não executam limpeza parcial.
  - Validação final da Fase 6 no HEAD `1c26508`: revisão ampla aprovada sem findings CRITICAL, IMPORTANT ou MINOR; typecheck/lint/build/diff-check PASS; suíte 637/637; E2E listou 1 teste; chunks lazy `CustomerDataPage`, `CustomerPasswordPage`, `CheckoutPage` e `OrderConfirmationPage` confirmados fora do entry. O build manteve aviso não bloqueante para o chunk principal de 720,40 kB.

### Fase 7 — Pedidos

[x] TASK-096: Criar schemas e adapters de lista, detalhe, status e cancelamento de pedido.
  - Status: DONE
  - Depends on: TASK-095
  - Critérios de aceite:
    - Validar lista paginada, detalhe, itens, status e resposta de cancelamento conforme o `openapi.yaml`, aceitando `number | string` nos campos numéricos e produzindo IDs inteiros positivos e números finitos no modelo interno.
    - Rejeitar enums desconhecidos, envelopes nulos ou com `status: false`, paginação inválida e recursos incompletos como erro de contrato, sem duplicar contratos canônicos já existentes.
    - Produzir request estrito de cancelamento contendo exclusivamente `{ "status": "Cancelado" }` e cobrir entradas válidas e inválidas com testes unitários.
  - Evidência: commits `204dee3` e `c53f533`; RED inicial confirmou ausência do módulo de contratos e RED da revisão reproduziu a aceitação de envelopes sem `status: true`; testes do contrato 28/28 e regressão pertinente 43/43; typecheck/lint/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-097: Implementar query paginada de pedidos dependente do CPF do perfil.
  - Status: DONE
  - Depends on: TASK-096, TASK-087
  - Critérios de aceite:
    - Reutilizar a query canônica do perfil e iniciar `GET /api/v1/pedido` somente quando sessão, token, cliente e CPF confirmado forem válidos, normalizando o CPF apenas no transporte.
    - Enviar CPF, período opcional, `page` e `size=20`, com Bearer e `AbortSignal`, e validar a resposta antes de colocá-la no cache.
    - Usar query key privada por `clienteId`, período, página e tamanho, sem token ou CPF na chave, isolar respostas tardias de outra sessão e não repetir automaticamente falhas não recuperáveis.
  - Evidência: commits `d345ba6`, `74bd100` e `ae3a527`; RED inicial confirmou ausência dos módulos de serviço/query, REDs de revisão reproduziram a deduplicação indevida entre sessões distintas e a fragmentação entre consumidores da mesma sessão; testes focados 15/15 e suíte de pedidos 36/36; typecheck/lint/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-098: Implementar filtros de data inicial e final sincronizados com a URL.
  - Status: DONE
  - Depends on: TASK-097
  - Critérios de aceite:
    - Parsear e serializar `dataInicio`, `dataFim` e `page` na URL, ignorando valores inválidos e preservando navegação voltar, avançar e refresh.
    - Aplicar e limpar filtros por campos de data com labels visíveis, validar `dataInicio <= dataFim` e voltar para a página 1 quando o período mudar.
    - Interpretar datas como civis locais inclusivas, enviando o início do primeiro dia e o fim do último dia em ISO 8601; não expor filtro de status nem tamanho de página na URL.
  - Evidência: commit `2d562c2`; RED confirmou ausência dos módulos de URL e filtro; testes focados 12/12 e suíte de pedidos 48/48; typecheck/lint/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-099: Implementar OrderCard com status do OpenAPI e total derivado dos itens.
  - Status: DONE
  - Depends on: TASK-096, TASK-021
  - Critérios de aceite:
    - Exibir identificador, data, forma de pagamento e rótulo amigável derivado exclusivamente de `Criado`, `EmProcessamento`, `Processado`, `Cancelado` ou `Devolvido`, com navegação SPA para o detalhe.
    - Calcular o total visual por `soma(quantidade × valorUnitario)` dos itens confirmados, sem persistir total derivado nem inventar frete, desconto ou promoção.
    - Fornecer semântica e nome acessíveis e reorganizar conteúdo e ações em uma coluna no mobile, sem overflow horizontal.
  - Evidência: commit `98831fc`; RED confirmou ausência dos módulos de card e apresentação; testes focados 9/9 e suíte de pedidos 57/57; typecheck/lint/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-100: Implementar página “Meus Pedidos” com paginação, vazio, erro e retry.
  - Status: DONE
  - Depends on: TASK-097, TASK-098, TASK-099, TASK-025
  - Critérios de aceite:
    - Substituir o placeholder protegido de `/pedidos` por rota lazy que componha filtros da URL, cards e paginação retornada pela API, mantendo `size=20` fixo.
    - Exibir skeleton com dimensões estáveis, vazio com ação para limpar o período quando aplicável, erro recuperável com retry manual e lista sem funcionalidades fora do MVP.
    - Tratar `404` da lista como erro de recurso, sem convertê-lo silenciosamente em vazio, e manter teclado, foco, região viva e responsividade entre 320 px e 1920 px.
  - Evidência: commits `b4ebe67` e `bebda5a`; RED confirmou ausência da página/rota real e reproduziu período invertido e página fora do total; testes focados 23/23 e suíte de pedidos/roteador/App 80/80; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-101: Implementar query e página de detalhe do pedido.
  - Status: DONE
  - Depends on: TASK-096, TASK-100
  - Critérios de aceite:
    - Aceitar somente `pedidoId` canônico inteiro positivo e chamar `GET /api/v1/pedido/{pedidoId}` com Bearer e `AbortSignal`, sem emitir requisição com ID sentinela ou inválido.
    - Carregar `/pedidos/:pedidoId` em chunk lazy e exibir endereço, data, pagamento, status, itens e total derivado, além de loading, `404` e erro recuperável com retry.
    - Manter chave privada por cliente e pedido, ignorar respostas tardias de outra sessão e preservar semântica e layout acessíveis entre mobile e desktop.
  - Evidência: commits `1519551` e `0e20917`; RED confirmou ausência dos módulos e headings principais ausentes nos estados de falha; teste focado da página 3/3 e suíte de pedidos/roteador/App 96/96; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-102: Hidratar em paralelo os produtos únicos exibidos no detalhe do pedido.
  - Status: DONE
  - Depends on: TASK-101, TASK-057
  - Critérios de aceite:
    - Deduplicar os `produtoId` dos itens e resolver os produtos únicos em paralelo com `Promise.all`, reutilizando a query e o cache canônicos de detalhe por produto.
    - Não copiar pedidos ou produtos para Zustand ou storage e isolar a falha de cada produto para que os demais itens continuem visíveis.
    - Exibir nome e imagem hidratados quando disponíveis e fallback acionável quando o produto não puder ser obtido, preservando quantidade e valor confirmados no pedido.
  - Evidência: commit `5915e5e`; RED confirmou ausência dos módulos de hidratação e corrigiu o estado pendente; testes focados de pedidos/cache do catálogo 89/89; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT.

[x] TASK-103: Implementar ação de cancelamento enviando somente o status `Cancelado`.
  - Status: DONE
  - Depends on: TASK-101, TASK-096, TASK-022
  - Critérios de aceite:
    - Exigir confirmação em dialog acessível antes de chamar `PATCH /api/v1/pedido/{pedidoId}` e enviar exclusivamente `{ "status": "Cancelado" }` com Bearer e `retry: false`.
    - Capturar pedido e sessão por tentativa, bloquear fechamento e submissões duplicadas enquanto pendente e ignorar sucesso tardio de outra sessão.
    - Ocultar a ação apenas para `Cancelado` e `Devolvido`; para os demais status, deixar a API decidir a transição e aceitar sucesso somente para envelope correspondente ao mesmo pedido e cliente.
  - Evidência: commit `19c9003`; TDD RED/GREEN incluindo bloqueio síncrono de confirmação duplicada; testes focados de pedidos 96/96; typecheck/lint/build/diff-check PASS; reviewer aprovado sem findings CRITICAL ou IMPORTANT. A suíte global apresentou flakes não relacionados em `useLogoutMutation` e `CustomerPasswordPage` (739/740 em execuções distintas), sem falhas na feature de pedidos; o primeiro passou isoladamente.

[x] TASK-104: Tratar recusa `422` recarregando o pedido e informando o usuário.
  - Status: DONE
  - Depends on: TASK-103
  - Critérios de aceite:
    - Em `422`, não alterar o status otimisticamente nem assumir cancelamento e reconciliar o detalhe com uma nova leitura do servidor.
    - Informar em alerta e região viva que o cancelamento não foi aceito e que o estado exibido foi atualizado, mantendo a recusa original mesmo se o refetch falhar.
    - Reabilitar a interface após a tentativa e não repetir automaticamente o PATCH; erros diferentes de `422` mantêm o tratamento geral e os dados confirmados.
  - Evidência: commits `881ab30` e `66058a4`; TDD RED confirmou que a recusa seguia o caminho genérico e, no review, que a chave exata não alcançava o detalhe ativo com `sessionScope`; GREEN focado 14/14, suíte de pedidos 99/99 e typecheck/lint/build/diff-check PASS; reviewer aprovado após correção, sem findings CRITICAL ou IMPORTANT.

[x] TASK-105: Invalidar lista e detalhe após cancelamento aceito.
  - Status: DONE
  - Depends on: TASK-103, TASK-104
  - Critérios de aceite:
    - Após resposta aceita, validada e ainda pertencente à sessão atual, atualizar ou invalidar o detalhe exato e invalidar todas as listas privadas de pedidos do cliente, independentemente de página ou período.
    - Aguardar a reconciliação em best-effort sem emitir um segundo PATCH e manter lista e detalhe convergentes com o servidor.
    - Não executar efeitos de sucesso em `422`, falha, envelope divergente ou resposta tardia, cobrindo detalhe e lista em teste de integração.
  - Evidência: commit `1728ec4`; TDD RED confirmou que cópias scoped do detalhe permaneciam com status anterior; GREEN focado 23/23, suíte de pedidos/checkout 186/186 e suíte global 746/746 em 115 arquivos; typecheck/lint/build/diff-check PASS e E2E listou o smoke test existente. Reviewer aprovado sem findings CRITICAL ou IMPORTANT; detalhe exato e todas as listas do cliente convergem por prefixos canônicos sem expor CPF ou token.

### Fase 8 — Testes e hardening

Lote 1: complete (3c7e575..f807f5a, broad review clean; gate 801/801)

Lote 2: complete (d130202..3eb713b, broad review clean; gate 835/835)

[x] TASK-106: Testar schemas e adapters com números em string, dados nulos, enums e contrato inválido.
  - Status: DONE
  - Depends on: TASK-012, TASK-013, TASK-034, TASK-041, TASK-046, TASK-063, TASK-076, TASK-080, TASK-086, TASK-092, TASK-096
  - Escopo: Frontend
  - Critérios de aceite:
    - Mapear a cobertura existente e testar, sem duplicar combinações equivalentes, `number` e string numérica em todos os IDs e valores transportados pelos schemas e adapters do frontend.
    - Aceitar `null` somente nos campos e envelopes permitidos pelos contratos e cobrir todos os enums canônicos de pagamento e status.
    - Rejeitar valores desconhecidos, `NaN`, infinito, inteiros inseguros, propriedades extras e envelopes de sucesso divergentes.
    - Executar com sucesso os testes focados de contratos, além de typecheck e lint, registrando a matriz de contratos coberta.
  - Evidência: commits `bb8a56b`, `e5ac699` e `da32b4c`; RED inicial reconstruído de forma transparente a partir do baseline e do diff interrompido, seguido de RED reproduzido no consumer estrito de login; GREEN focado 183/183, consumers 607/607 e LoginPage 6/6; typecheck/lint/diff-check PASS; reviewer aprovado sem findings.

[x] TASK-107: Testar formatadores e normalizadores de moeda, CPF, telefone, CEP e datas.
  - Status: DONE
  - Depends on: TASK-007, TASK-042, TASK-098, TASK-099
  - Escopo: Frontend
  - Critérios de aceite:
    - Testar moeda brasileira com zero, valor negativo, decimal e locale esperado.
    - Testar CPF, CEP e telefone com entrada progressiva, caracteres estranhos e limites de tamanho.
    - Testar datas civis locais sem deslocamento por timezone, limites inclusivos, apresentação inválida e round-trip quando aplicável.
    - Executar com sucesso os testes focados de formatadores e normalizadores, além de typecheck e lint, registrando a cobertura existente reutilizada.
  - Evidência: commits `bc88d9c` e `20abb4f`; RED com helper de moeda ausente e `Invalid Date` sem `RangeError`; GREEN focado 33/33 e suíte combinada 149/149; timezone UTC 12/12; typecheck/lint/diff-check PASS; reviewer aprovado com 0 CRITICAL/IMPORTANT e 2 MINOR documentais resolvidos.

[x] TASK-108: Testar `authStore`, expiração, escolha de storage e migração de versão.
  - Status: DONE
  - Depends on: TASK-032, TASK-033, TASK-037, TASK-039, TASK-040
  - Escopo: Frontend
  - Critérios de aceite:
    - Validar a escolha entre `sessionStorage` e `localStorage`, com limpeza do storage anterior, e a reidratação de sessão válida.
    - Limpar memória e ambos os storages quando a expiração estiver ausente, inválida ou atingida, e expirar sessão ativa pelo timer.
    - Migrar ou descartar com segurança payload de versão anterior, corrompido ou com dados extras, sem lançar exceção.
    - Manter o aplicativo utilizável quando a leitura ou escrita no storage falhar e executar com sucesso testes focados, typecheck e lint.
  - Evidência: commits `f5c2de4` e `f736141`; REDs de 5 falhas/14 testes para payload atual inválido, 3 falhas/17 para v0 e JSON corrompido e 1 falha/20 para cleanup stale sob escrita parcial; GREEN final de autenticação 32/32; typecheck/lint/diff-check PASS; reviewer aprovado com 0 findings.

[x] TASK-109: Testar `cartSessionStore`, troca de cliente, ID inválido e migração de versão.
  - Status: DONE
  - Depends on: TASK-062, TASK-068, TASK-075, TASK-095
  - Escopo: Frontend
  - Critérios de aceite:
    - Isolar IDs de carrinho por cliente e garantir que atualização, troca ou remoção altere somente a chave alvo.
    - Descartar chaves, IDs e campos remotos inválidos, migrar a versão zero e sanitizar dados corrompidos na versão atual.
    - Preservar o uso em memória quando o `localStorage` falhar.
    - Mapear cada critério para teste existente ou adicionar somente a evidência ausente, executar testes focados, typecheck e lint e registrar a prova sem alterar o produto se a cobertura já for integral.
  - Evidência: commits `731b1bd` e `d240368`; baseline de 10/10 PASS em duas execuções; cobertura ampliada para 12/12 PASS em duas execuções para provar falhas de `getItem` e `removeItem`; consumers relevantes 52/52 PASS; typecheck/lint/diff-check PASS; produto e actions públicas inalterados; reviewer aprovado com 0 findings.

[x] TASK-110: Testar componentes base por teclado, foco, estados e nomes acessíveis.
  - Status: DONE
  - Depends on: TASK-019, TASK-020, TASK-021, TASK-022, TASK-023, TASK-024, TASK-025, TASK-026
  - Escopo: Frontend
  - Critérios de aceite:
    - Validar operação por teclado de botões, links, campos, `QuantityInput`, paginação, dialog, menu e componentes de feedback.
    - Verificar foco inicial, trap, Escape e retorno de foco onde aplicável.
    - Cobrir estados disabled, loading, error, empty e skeleton e consultar nomes, descrições, roles, `aria-current` e regiões vivas por semântica.
    - Registrar a matriz componente por critério e executar com sucesso somente os testes necessários para células descobertas, além de typecheck e lint.
  - Evidência: commits `a1c2665`, `cbaecf8` e `62d92b8`; `user-event` focado 17/17, shared UI 43/43 e consumers relevantes 136/136; typecheck/lint/diff-check PASS; produto inalterado. Button ativa por Enter/Space, LinkButton navega por Enter e Checkbox alterna por Space; o Select usa foco por Tab e `user.selectOptions`, fluxo aceito porque `user-event` 14.6.1 não implementa mudança por `ArrowDown` no jsdom. A re-review aprovou teclado e rastreabilidade e solicitou somente o ajuste documental final incorporado. Desvio justificado: o teste monolítico não foi criado por duplicar provas proprietárias; somente células GAP foram adicionadas. O commit `59acae2` é administrativo do lote e está fora do range funcional da task.

[x] TASK-111: Testar integração de login, logout, `401` e retorno seguro com MSW.
  - Status: DONE
  - Depends on: TASK-009, TASK-035, TASK-036, TASK-037, TASK-038, TASK-039, TASK-040, TASK-061, TASK-106, TASK-107, TASK-108, TASK-109, TASK-110
  - Escopo: Frontend
  - Critérios de aceite:
    - Usar MSW e providers reais para persistir login conforme a escolha e aceitar somente `returnTo` interno, usando rota segura para valor externo ou malformado.
    - Chamar o endpoint de logout e limpar stores e caches privados mesmo diante de falha remota ou token expirado.
    - Tratar `401` de leitura protegida uma única vez, limpar dados privados e redirecionar sem permitir que requests tardios restaurem cache ou sessão.
    - Verificar request, efeito visível, cache e rota, executar testes focados, typecheck e lint e falhar diante de endpoint, método ou reconciliação incorretos.
  - Evidência: commits `6ec0d8e` e `272cb59`; integração auth 8/8 PASS, suite auth 64/64 PASS, consumidores App/cart/checkout 230/230 PASS e expiração ativa 1/1 PASS; typecheck/lint/diff-check PASS; review do range `09c47fb..272cb59` aprovada com 0 findings. Quatro warnings preexistentes de `act(...)` na suite de checkout estão fora do diff e não são bloqueantes.

[x] TASK-112: Testar integração de cadastro e perfil com respostas `201`, `409` e `422`.
  - Status: DONE
  - Depends on: TASK-009, TASK-041, TASK-042, TASK-043, TASK-044, TASK-045, TASK-086, TASK-087, TASK-088, TASK-089, TASK-090, TASK-091, TASK-092, TASK-093, TASK-094, TASK-095, TASK-106, TASK-107, TASK-108, TASK-109, TASK-110
  - Escopo: Frontend
  - Critérios de aceite:
    - Com MSW e providers reais, validar o body normalizado do cadastro e a navegação com confirmação após `201`.
    - Apresentar `409` no campo ou resumo sem perder valores e mapear propriedades conhecidas e desconhecidas de `422` sem emitir sucesso.
    - Preencher o perfil por GET, confirmar alteração de CPF, enviar PUT completo e reconciliar o cache somente após resposta válida.
    - Verificar requests e efeitos visíveis e executar com sucesso testes focados, typecheck e lint.
  - Evidência: commits `b12c096`, `aa4815c` e `93512ff`; integração e consumidores customer 50/50 PASS; typecheck/lint/diff-check PASS; review do range `aeed2db..93512ff` aprovada com 0 findings.

[x] TASK-113: Testar integração de catálogo, categoria, busca, paginação e produto `404` com MSW.
  - Status: DONE
  - Depends on: TASK-009, TASK-046, TASK-047, TASK-048, TASK-049, TASK-050, TASK-051, TASK-052, TASK-053, TASK-054, TASK-055, TASK-056, TASK-057, TASK-058, TASK-059, TASK-060, TASK-061, TASK-106, TASK-107, TASK-108, TASK-109, TASK-110
  - Escopo: Frontend
  - Critérios de aceite:
    - Com MSW e providers reais, iniciar categorias e primeira página do catálogo em paralelo e usar exclusivamente o endpoint dedicado ao filtrar por categoria.
    - Serializar busca e página na URL e no request, seguir a metadata de paginação e restaurar a consulta no histórico.
    - Canonicalizar filtros inválidos e exibir estado específico para produto `404` sem retry.
    - Verificar request, efeito visível, cache e rota e executar com sucesso testes focados, typecheck e lint.
  - Evidência: commits `929444e`, `a06a1b1` e `7fc8285`; integração de catálogo 5/5 PASS e catálogo/consumidores 75/75 PASS; typecheck/lint/diff-check PASS; review do range `2373274..7fc8285` aprovada sem findings CRITICAL ou IMPORTANT. A observação MINOR registrada está fora do escopo da TASK-113.

[x] TASK-114: Testar criação, leitura, atualização, remoção e rollback do carrinho com MSW.
  - Status: DONE
  - Depends on: TASK-009, TASK-062, TASK-063, TASK-064, TASK-065, TASK-066, TASK-067, TASK-068, TASK-069, TASK-070, TASK-071, TASK-072, TASK-073, TASK-074, TASK-075, TASK-106, TASK-107, TASK-108, TASK-109, TASK-110
  - Escopo: Frontend
  - Critérios de aceite:
    - Com MSW e providers reais, criar carrinho sem body antes do primeiro item e ler o carrinho existente.
    - Alterar quantidade por PATCH e remover por DELETE somente após confirmação, emitindo cada request esperado uma vez.
    - Em falhas, restaurar somente o item alvo e preservar mudanças concorrentes; em `404`, remover o vínculo local.
    - Confirmar convergência entre resposta validada, caches, lista e badge e executar com sucesso testes focados, typecheck e lint.
  - Evidência: commits `a86a77f` e `dfa6bd1`; carrinho 139/139 PASS, consumidores 46/46 PASS e revisão focada 6/6 PASS; typecheck/lint/diff-check PASS; review do range `c034c13..dfa6bd1` aprovada sem findings CRITICAL ou IMPORTANT. Nenhuma mudança de produto foi necessária.

[x] TASK-115: Testar checkout e criação de pedido sem `clienteId` e `carrinhoId` no payload.
  - Status: DONE
  - Depends on: TASK-009, TASK-076, TASK-077, TASK-078, TASK-079, TASK-080, TASK-081, TASK-082, TASK-083, TASK-084, TASK-085, TASK-106, TASK-107, TASK-108, TASK-109, TASK-110, TASK-114
  - Escopo: Frontend
  - Critérios de aceite:
    - Com MSW e providers reais, carregar carrinho e perfil confirmados e criar o pedido com itens confirmados, contrato estrito e data ISO.
    - Garantir que o payload nunca contenha `clienteId` ou `carrinhoId` e que submissão duplicada produza somente um POST.
    - Após `201`, limpar o vínculo, invalidar pedidos e navegar para a confirmação; em `409` ou `422`, preservar o checkout e não executar efeitos de sucesso.
    - Verificar request, cache e rota e executar com sucesso testes focados, typecheck e lint.
  - Evidência: commits `c114921` e `fdb0a68`; integração 201/409/422 3/3 PASS, página/navegação/mutation 24/24 PASS, consumidores de checkout 89/89 PASS e revisão focada 27/27 PASS; typecheck/lint/diff-check PASS; review do range `172bbcc..fdb0a68` aprovada sem findings CRITICAL ou IMPORTANT. Quatro warnings preexistentes de React `act(...)` permaneceram não bloqueantes.

[x] TASK-116: Testar lista, detalhe e cancelamento recusado de pedido com MSW.
  - Status: DONE
  - Depends on: TASK-009, TASK-096, TASK-097, TASK-098, TASK-099, TASK-100, TASK-101, TASK-102, TASK-103, TASK-104, TASK-105, TASK-106, TASK-107, TASK-108, TASK-109, TASK-110
  - Escopo: Frontend
  - Critérios de aceite:
    - Com MSW e providers reais, enviar CPF, período e paginação corretos na lista e usar cliente e pedido capturados no detalhe.
    - Hidratar somente produtos únicos e enviar exclusivamente `{ "status": "Cancelado" }` no PATCH.
    - Em `422`, anunciar a recusa, manter o status confirmado e recarregar o detalhe; no sucesso, reconciliar detalhe e todas as listas privadas do cliente.
    - Verificar requests, efeitos e caches e executar com sucesso testes focados, typecheck e lint.
  - Evidência: commits `361d5e9`, `0019dc4` e `0b9f9fb`; integração de pedidos 4/4 PASS, pedidos 111/111 PASS e consumidores 18/18 PASS; typecheck/lint/diff-check PASS; review do range `26bb032..0b9f9fb` aprovada sem findings CRITICAL ou IMPORTANT. Nenhuma mudança de produto foi necessária.

[x] TASK-117: Criar E2E de cadastro, login, rota protegida e logout.
  - Status: DONE
  - Depends on: TASK-010, TASK-111, TASK-112, TASK-113, TASK-114, TASK-115, TASK-116
  - Escopo: Frontend
  - Critérios de aceite:
    - Criar fixtures e handlers Playwright determinísticos, com dados nomeados por teste, contadores de requests reiniciados no `beforeEach` e falha para requests não declarados.
    - Iniciar cada contexto sem cookies, `localStorage`, `sessionStorage` ou estado do backend simulado e remover dados criados no `afterEach`, inclusive após falha.
    - Cadastrar, receber confirmação, logar, acessar rota protegida, confirmar a persistência escolhida após refresh e deslogar removendo o acesso protegido.
    - Afirmar a contagem exata de cada request e executar a spec isolada, a suíte Chromium e `playwright test --repeat-each=2` sem dependência de ordem, worker ou dados anteriores.
  - Evidência: commits `1df7671`, `5dcaf30`, `56c0c5c`, `b7ab442` e `17b3656`; contagens brutas `register=1`, `login=1`, `categories=4`, `profile=2` e `logout=1`; suíte Chromium 2/2 PASS e `--repeat-each=2` 4/4 PASS; typecheck/lint/build/diff-check PASS; review do range `be8ef3e..17b3656` aprovada sem findings CRITICAL ou IMPORTANT. `npm audit` reportou duas vulnerabilidades moderadas e o build manteve o warning de chunk acima de 500 kB, ambos não bloqueantes.

[x] TASK-118: Criar E2E de visitante redirecionado ao login antes de adicionar um produto.
  - Status: DONE
  - Depends on: TASK-010, TASK-060, TASK-061, TASK-111, TASK-112, TASK-113, TASK-114, TASK-115, TASK-116, TASK-117
  - Escopo: Frontend
  - Critérios de aceite:
    - Reutilizar a infraestrutura determinística da TASK-117, com storage e backend isolados e seletores semânticos.
    - Como visitante, selecionar quantidade e tentar adicionar, sendo redirecionado para `/entrar` com retorno interno exato.
    - Após login, retornar ao produto sem POST automático de carrinho; exigir novo clique para adicionar.
    - Afirmar a contagem exata dos requests e executar a spec isolada e a suíte E2E Chromium sem dependência de ordem.
  - Evidência: commits `d78bc3a`, `fe7ac0e`, `87e5aa2` e `56ce200`; contagens exatas `login=1`, `categories=1`, `product=2`, `cartCreate=1`, `cartAdd=1` e `cartGet=2`, com `register`, `profile` e `logout` iguais a zero; spec isolada com repetição 2/2 PASS e suíte Chromium com repetição 6/6 PASS; typecheck/lint/build/diff-check PASS; review do range `2745a4c..56ce200` aprovada sem findings CRITICAL ou IMPORTANT. Os dois GETs do carrinho correspondem à ativação do badge após `setCartId` e à reconciliação após adicionar o item, sem espera temporal.

[x] TASK-119: Criar E2E de adicionar, alterar quantidade e remover item do carrinho.
  - Status: DONE
  - Depends on: TASK-010, TASK-111, TASK-112, TASK-113, TASK-114, TASK-115, TASK-116, TASK-117
  - Escopo: Frontend
  - Critérios de aceite:
    - Reutilizar a infraestrutura determinística da TASK-117 e iniciar a jornada autenticada com estado isolado.
    - Adicionar produto e confirmar badge e lista; alterar quantidade e confirmar subtotal e total.
    - Remover o item após confirmação e exibir carrinho vazio com badge zero.
    - Afirmar que cada request ocorre uma vez e executar a spec isolada e a suíte E2E Chromium sem dependência de ordem.
  - Evidência: commits funcionais `292557b` e `0b38d98`, ajuste documental `314124e` e relatório `652839c`; range revisado `c461201..652839c` aprovado sem findings CRITICAL ou IMPORTANT. Contagens brutas `login=1`, `categories=3`, `product=2`, `cartCreate=1`, `cartAdd=1`, `cartGet=4`, `cartUpdate=1` e `cartDelete=1`, com os demais ledgers iguais a zero; as três leituras de categorias correspondem às montagens do shell antes do redirect, após o login e na carga direta do produto. RED comportamental confirmado no PATCH inesperado; spec isolada 1/1, compatibilidade com visitante 2/2, repetição isolada 2/2, suíte Chromium 4/4 e repetição completa 8/8 PASS; typecheck/lint/build/diff-check PASS. O build manteve apenas o warning preexistente de chunk acima de 500 kB.

[x] TASK-120: Criar E2E de carrinho, checkout e confirmação do pedido.
  - Status: DONE
  - Depends on: TASK-010, TASK-111, TASK-112, TASK-113, TASK-114, TASK-115, TASK-116, TASK-117, TASK-119
  - Escopo: Frontend
  - Critérios de aceite:
    - Reutilizar a infraestrutura determinística da TASK-117 e iniciar com carrinho autenticado não vazio e isolado.
    - Abrir o checkout, usar ou editar o endereço somente para o pedido e selecionar a forma de pagamento.
    - Enviar o pedido uma única vez, exibir a confirmação com dados da resposta do servidor e consumir o carrinho.
    - Afirmar requests e estados finais e executar a spec isolada e a suíte E2E Chromium sem dependência de ordem.
  - Evidência: commits funcionais `8826f4c` e `2f33090`, documentação `634fa8a`, correção `b72e9ee` e estabilização `2a63572`; contagens brutas estáveis `register=0`, `login=1`, `categories=2`, `catalog=1`, `profile=1`, `logout=0`, `product=2`, `cartCreate=1`, `cartAdd=1`, `cartGet=2`, `cartUpdate=0`, `cartDelete=0` e `orderCreate=1`. RED original confirmado no POST inesperado de `/api/v1/pedido`; a task foi reaberta quando `--repeat-each=20` reproduziu 5/20 falhas (`categories` 2/3) causadas pela corrida entre a consulta do `StoreLayout` e o redirect do `ProtectedRoute` ao iniciar por `/carrinho`. A jornada passou a iniciar diretamente em `/entrar`, aguardar as consultas paralelas e estritamente validadas de categorias e catálogo da home, confirmar `/` após login e carregar o produto integralmente, removendo a requisição cancelável sem relaxar as contagens exatas. Estabilização focada 20/20 PASS, suíte Chromium atual repetida 12/12 PASS e typecheck/lint/build/diff-check PASS; TASK-120 permanece `DONE`. O build manteve apenas o warning preexistente de chunk acima de 500 kB.

[x] TASK-121: Criar E2E de edição de dados e troca de senha.
  - Status: DONE
  - Depends on: TASK-010, TASK-111, TASK-112, TASK-113, TASK-114, TASK-115, TASK-116, TASK-117
  - Escopo: Frontend
  - Critérios de aceite:
    - Reutilizar a infraestrutura determinística da TASK-117 e carregar o perfil autenticado em estado isolado.
    - Editar e salvar o perfil, exigindo confirmação para alteração de CPF e confirmando os dados salvos após refresh.
    - Exibir regras, erros e sucesso da troca de senha e limpar valores sensíveis após a tentativa concluída.
    - Afirmar a contagem dos requests e executar a spec isolada e a suíte E2E Chromium sem dependência de ordem.
  - Evidência: commits funcionais `ed6f75d` e `a3a7114` e relatório `d8dfaa8`; range revisado `9838c65..d8dfaa8` aprovado sem findings CRITICAL ou IMPORTANT após a resolução do blocker da TASK-120. A jornada da conta executou 20/20 PASS, a suíte Chromium completa 12/12 PASS e typecheck/lint/build/diff-check PASS.

[x] TASK-122: Criar E2E de consulta, detalhe e tentativa de cancelamento de pedido.
  - Status: DONE
  - Depends on: TASK-010, TASK-111, TASK-112, TASK-113, TASK-114, TASK-115, TASK-116, TASK-117
  - Escopo: Frontend
  - Critérios de aceite:
    - Reutilizar a infraestrutura determinística da TASK-117 e iniciar com pedidos conhecidos e isolados.
    - Listar e filtrar pedidos, abrir o detalhe e tentar cancelar o pedido.
    - Receber `422`, anunciar a recusa e manter o status confirmado após reload.
    - Afirmar a contagem dos requests e executar a spec isolada e a suíte E2E Chromium sem dependência de ordem.
  - Evidência: commits `17a5ee9`, `2954271`, `cdfd5a7` e `a02eb42`; revisões final e incremental aprovadas sem findings CRITICAL ou IMPORTANT. O RED inicial alcançou `GET /api/v1/pedido` no handler que aceitava somente POST; o RED incremental reproduziu a classificação indevida `product=0/orderProduct=2` após o `422` e refetch com produto em cache. O GREEN correlaciona a hidratação consumível com o frame corrente e preserva `Criado` após recusa e reload. Contagens finais: `register=0`, `login=2`, `categories=5`, `catalog=1`, `profile=1`, `profileUpdate=0`, `passwordUpdate=0`, `logout=0`, `product=1`, `cartCreate=0`, `cartAdd=0`, `cartGet=0`, `cartUpdate=0`, `cartDelete=0`, `orderCreate=0`, `ordersList=2`, `orderDetail=4`, `orderProduct=3` e `orderCancel=1`. Spec isolada 1/1, repetição isolada 20/20, suíte Chromium repetida 14/14, typecheck, lint e diff-check PASS.

[x] TASK-123: Criar E2E de sessão expirada durante acesso protegido.
  - Status: DONE
  - Depends on: TASK-010, TASK-108, TASK-111, TASK-112, TASK-113, TASK-114, TASK-115, TASK-116, TASK-117
  - Escopo: Frontend
  - Critérios de aceite:
    - Reutilizar a infraestrutura determinística da TASK-117 e controlar o relógio e os storages por teste.
    - Negar a rota protegida com sessão restaurada já expirada ou expirada durante o uso.
    - Limpar storages e caches privados, redirecionar com retorno interno seguro e impedir que voltar ou atualizar reabra conteúdo privado.
    - Afirmar requests e estados de limpeza e executar a spec isolada e a suíte E2E Chromium sem dependência de ordem.
  - Evidência: commits `ca333a1`, `b02e2d9`, `0e48f78`, `ee735e6`, `e3b2080`, `a7be7f1`, `449bcbb` e `714f50e`; revisão final aprovada sem findings CRITICAL ou IMPORTANT. Os REDs reproduziram módulo de limpeza ausente, identidade expirada descartada, caches privados preservados, agendamento inválido para `expiraEm` malformado/token vazio e ausência de prova pré-login. O GREEN captura e consome atomicamente a identidade transitória não persistida, nega a rota sincronamente, limpa ambos auth storages, associação do carrinho, queries/mutations privadas e snapshots, preserva retorno interno e mantém back/reload bloqueados. Antes do primeiro login, requests privados permanecem explicitamente em zero; contagens finais: cenário restaurado `login=1`, `categories=2`, `profile=1`, `ordersList=1`, demais `0`; cenário com duas expirações `login=2`, `categories=2`, `profile=2`, `ordersList=2`, demais `0`. Testes focados 29/29, spec 2/2, repetição 40/40, Chromium 9/9 e repetido 18/18, suíte unitária 839/839, typecheck, lint, build e diff-check PASS.

[x] TASK-124: Aplicar lazy loading às rotas de checkout, conta e pedidos.
  - Status: DONE
  - Depends on: TASK-018, TASK-077, TASK-085, TASK-086, TASK-087, TASK-088, TASK-089, TASK-090, TASK-091, TASK-092, TASK-093, TASK-094, TASK-095, TASK-096, TASK-097, TASK-098, TASK-099, TASK-100, TASK-101, TASK-102, TASK-103, TASK-104, TASK-105, TASK-117, TASK-118, TASK-119, TASK-120, TASK-121, TASK-122, TASK-123
  - Escopo: Frontend
  - Critérios de aceite:
    - Usar imports dinâmicos para checkout, confirmação, dados pessoais, senha, lista e detalhe de pedidos.
    - Manter fallback com `role="status"`, nome acessível e geometria estável e testar o carregamento sob demanda.
    - Executar o build e comprovar chunks separados para as rotas lazy, sem vazamento para o chunk inicial.
    - Mapear cada critério para a evidência existente e alterar o produto somente se a verificação falhar; executar testes focados, typecheck, lint e build.
  - Evidência: commits `0320b1e`, `97b0b15` e `dcb911b`; revisão independente aprovada sem findings CRITICAL ou IMPORTANT e com o MINOR de unidade corrigido no relatório. O RED focado reproduziu 2 falhas/6 testes: checkout sem `min-h-96` e confirmação reutilizando o status `Carregando checkout`; o GREEN passou 6/6. A suíte completa passou 126 arquivos/842 testes, além de typecheck, lint, build e diff-check. O build preservou seis chunks separados (`CheckoutPage` 15,02 KiB, `OrderConfirmationPage` 4,64 KiB, `CustomerDataPage` 26,58 KiB, `CustomerPasswordPage` 9,10 KiB, `OrdersPage` 11,33 KiB e `OrderDetailPage` 17,34 KiB), com marcadores exclusivos presentes nos chunks corretos e ausentes do entry inicial. O entry `index-BZwkBxYl.js` mediu 711,10 KiB por `Length / 1KB` (728,17 kB decimais no Vite) e manteve o warning acima de 500 kB explicitamente delegado à TASK-125.

[x] TASK-125: Auditar waterfalls, deduplicação de produtos, re-renderizações e imports que ampliem o bundle.
  - Status: DONE
  - Depends on: TASK-053, TASK-069, TASK-102, TASK-117, TASK-118, TASK-119, TASK-120, TASK-121, TASK-122, TASK-123, TASK-124
  - Escopo: Frontend
  - Critérios de aceite:
    - Medir com React Profiler em Vitest a Home inicial, o carrinho com IDs repetidos e o detalhe de pedido com IDs repetidos, executando cada cenário cinco vezes no mesmo ambiente e registrando a mediana antes e depois.
    - Listar e eliminar commits repetidos que mantenham props, query data e estado visível iguais; a mediana final não pode superar o baseline.
    - Confirmar categorias e catálogo sem waterfall e uma consulta por ID único de produto em cada carga fria de carrinho e pedido.
    - Executar o build, manter cada chunk JavaScript inicial em até 500 kB não comprimidos e cada rota lazy separada, registrando ambiente, medições, requests, chunks e grafo de imports sem rota lazy alcançando o chunk inicial.
  - Evidência: planos `25e5d8a`, `330cbbd` e `0f4852b`; implementação `f99332c`, `e90247d`, `0f84086`, `2ca0ab6` e `01b9420`; revisão final sem findings CRITICAL ou IMPORTANT. O Profiler executou warmup descartado e cinco amostras rotacionadas por cenário com fingerprints pós-commit de DOM semântico, queries e props: Home 2 commits, mediana 17,7773 ms e faixa 15,1650–19,3846; carrinho 5 commits, mediana 24,9446 ms e faixa 23,1429–25,1589; pedido 4 commits, mediana 19,0437 ms e faixa 17,5528–22,8792; zero redundâncias consecutivas em todas as amostras, sem alterações especulativas nas páginas. Home preservou categorias e catálogo paralelos; carrinho e pedido com IDs `[5, 5, 9]` emitiram somente requests de produto 5 e 9. O bootstrap removeu top-level await e o plugin associado; o entry caiu de 728165 para 464141 bytes, com seis chunks lazy distintos fora do fecho estático. Suíte 850/850, E2E Chromium 9/9, typecheck, lint, build/auditoria e diff-check PASS.

[x] TASK-126: Auditar persistência local, remoção de dados privados e ausência de logs sensíveis.
  - Status: DONE
  - Depends on: TASK-032, TASK-039, TASK-040, TASK-062, TASK-084, TASK-095, TASK-108, TASK-109, TASK-117, TASK-118, TASK-119, TASK-120, TASK-121, TASK-122, TASK-123
  - Escopo: Frontend
  - Critérios de aceite:
    - Inventariar cada chave persistida e restringir auth à sessão necessária e carrinho ao mapa de IDs.
    - Comprovar que CPF, endereço, perfil, itens e respostas não são persistidos em storage.
    - Limpar ambos os storages, query cache, mutation cache e snapshots privados em logout, `401` e cancelamento de conta, sem permitir restauração por requests tardios.
    - Executar busca estática sem `console.*`, token ou CPF em mensagens, testar os fluxos de limpeza e registrar relatório reproduzível, além de typecheck e lint.
  - Evidência: planos `26f361d` e `7ae9431`; implementação `ab8fc29`, `54b9ce4`, `6902152`, `29cc1fa`, `3a3a05d`, `c10052d`, `d63069f`, `0160346`, `cc9aa6c`, `1417231` e `f7bf7eb`; revisão final aprovada sem findings CRITICAL ou IMPORTANT. O inventário confirmou somente `shop-api:auth`, com a sessão contratada, e `shop-api:cart-session`, somente com `cartIdsByCustomer`. Logout, `401` e cancelamento limpam ambos os storages, queries, mutations e snapshots privados sem afetar estado público ou sessão sucessora; respostas tardias não restauram storage, cache ou reconciliação. O auditor AST validou contratos positivos exatos em 152 arquivos, rejeitou 19 fixtures negativas e confirmou zero `console.*`. Suíte 856/856, typecheck, lint, build com entry de 464,57 kB, E2E Chromium 1/1, diff-check e revisão independente PASS.

[x] TASK-127: Auditar responsividade entre 320 px e desktop amplo sem overflow horizontal.
  - Status: DONE
  - Depends on: TASK-030, TASK-043, TASK-052, TASK-058, TASK-071, TASK-079, TASK-088, TASK-093, TASK-100, TASK-101, TASK-117, TASK-118, TASK-119, TASK-120, TASK-121, TASK-122, TASK-123
  - Escopo: Frontend
  - Critérios de aceite:
    - Auditar as rotas principais nos viewports de 320, 375, 768, 1024 e 1920 px.
    - Manter `scrollWidth <= clientWidth` no documento, permitindo rolagem horizontal somente em componentes explicitamente documentados.
    - Confirmar que controles, dialogs e formulários permanecem utilizáveis em todos os viewports.
    - Registrar screenshots, findings e correções e executar a auditoria responsiva e os gates locais aplicáveis sem falhas.
  - Evidência: planos `d172cd2` e `2b53e00`; implementação `e9e50e4`, `6088d84`, `4f7af8b`, `b5e701d`, `594138e` e `0fa3123`; revisão independente aprovada sem findings CRITICAL ou IMPORTANT. A matriz executou 5 viewports × 13 estados, totalizando 65/65 checkpoints e screenshots anexadas, com anti-flake de 25/25 jornadas e 325 checkpoints; shards 1/5 e 5/5 executaram uma jornada cada. O auditor exige documento e controles integralmente contidos e permite exatamente `categories`, `account-navigation` e `pagination`. Um RED real no resumo do carrinho em 1024/1920 px (`scrollWidth=324`, `clientWidth=270`) foi corrigido mantendo as ações em coluna; o ledger estrito foi idêntico nos cinco viewports, incluindo login, carrinho, checkout, conta e pedidos. Suíte Chromium 14/14, repetição 28/28, Vitest 856/856, typecheck, lint, build com entry de 464,68 kB, diff-check e ausência de artefatos Playwright rastreados PASS.

[x] TASK-128: Auditar navegação por teclado, foco, contraste, regiões vivas e movimento reduzido.
  - Status: DONE
  - Depends on: TASK-007, TASK-019, TASK-020, TASK-021, TASK-022, TASK-023, TASK-024, TASK-025, TASK-026, TASK-027, TASK-028, TASK-029, TASK-030, TASK-031, TASK-110, TASK-117, TASK-118, TASK-119, TASK-120, TASK-121, TASK-122, TASK-123, TASK-127
  - Escopo: Frontend
  - Critérios de aceite:
    - Concluir as jornadas principais somente por teclado e verificar ordem, visibilidade e restauração de foco.
    - Validar nomes, roles, landmarks, headings e anúncios de erros, status e toasts por regiões vivas.
    - Medir contraste conforme WCAG AA e comprovar que `prefers-reduced-motion` remove movimento não essencial.
    - Concluir auditoria automatizada sem violações sérias, registrar checklist manual e executar os gates locais aplicáveis sem falhas.
  - Evidência: planos `57a7304` e `3c7128a`; implementação `a505adc`, `6c73d11`, `2ae1980`, `5d23b32`, `2a99661`, `aa1399d`, `07b5223`, `851c5bc`, `c0d4822`, `badbc03` e `d112336`; revisão independente concluída sem findings CRITICAL ou IMPORTANT, com os findings MINOR finais de landmark `role="navigation"` genérico e contraste isolado de texto grande corrigidos. A jornada cobre sete estados por teclado, foco e restauração em menu e três dialogs, regiões vivas, semântica, contraste WCAG AA e movimento reduzido em elementos e pseudo-elementos. Accessibility final 6/6 e testes focados finais 2/2 PASS; anti-flake accessibility 50/50, Chromium 19/19 e repetição 38/38; Vitest 130 arquivos/863 testes, typecheck, lint, build com entry de 465,83 kB, diff-check e ausência de artifacts Playwright rastreados PASS.

[ ] TASK-129: Documentar instalação, variáveis de ambiente, scripts e execução integrada no README do frontend.
  - Status: READY
  - Depends on: TASK-003, TASK-009, TASK-010, TASK-011, TASK-117, TASK-118, TASK-119, TASK-120, TASK-121, TASK-122, TASK-123, TASK-126
  - Escopo: Frontend
  - Critérios de aceite:
    - Criar `frontend/README.md` com requisitos e versões, instalação e configuração de `VITE_API_BASE_URL` e ativação opt-in do MSW.
    - Documentar todos os scripts e a execução integrada com API, PostgreSQL e Docker, além de testes unitários, E2E e build.
    - Documentar troubleshooting e a política de dados locais inventariada na TASK-126.
    - Validar em checkout limpo que os comandos documentados podem ser copiados e executados com sucesso.

[ ] TASK-130: Executar typecheck, lint, testes, E2E e build como gate final do MVP.
  - Status: BLOCKED
  - Depends on: TASK-106, TASK-107, TASK-108, TASK-109, TASK-110, TASK-111, TASK-112, TASK-113, TASK-114, TASK-115, TASK-116, TASK-117, TASK-118, TASK-119, TASK-120, TASK-121, TASK-122, TASK-123, TASK-124, TASK-125, TASK-126, TASK-127, TASK-128, TASK-129
  - Escopo: Frontend
  - Critérios de aceite:
    - Em checkout limpo, executar `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e` e `npm run build`, todos com exit code zero.
    - Rejeitar `.only`, erros, rejeições não tratadas e alterações pendentes produzidas pelo gate.
    - Registrar contagens, duração, ambiente e commit exato da execução.
    - Se houver falha, reabrir a task dona do comportamento e não corrigir produto diretamente na TASK-130.

### Fase 9 — Ajustes de experiência

[x] TASK-131: Adicionar ações de checkout e continuidade de compra ao resumo do carrinho.
  - Status: DONE
  - Depends on: TASK-071, TASK-077
  - Escopo: Frontend
  - Critérios de aceite:
    - Quando o carrinho tiver itens, exibir no `CartSummary` um `LinkButton` secundário com o texto “Continuar comprando” e destino `/`, seguido de um `LinkButton` primário com o texto “Ir para checkout” e destino `/checkout`.
    - Quando o carrinho não tiver itens, não renderizar nenhuma das duas ações no `CartSummary`.
    - Manter nomes acessíveis, navegação e ativação por teclado, foco visível e layout responsivo sem overflow horizontal entre 320 px e desktop amplo.
    - Cobrir por testes a renderização das ações com itens, seus textos e destinos exatos, e a ausência das ações sem itens.
    - Não alterar regras de negócio do carrinho, caches, mutations ou o guard de checkout.
  - Evidência: commit `665e85c`; RED 1 falha/17 pass e GREEN 18/18; gate final global 115 arquivos/747 testes; typecheck/lint/build/diff-check PASS; revisores aprovaram sem findings CRITICAL, IMPORTANT ou MINOR. TASK-132 e TASK-133 resolveram o gate externo necessário para concluir esta task.

[x] TASK-132: Corrigir a normalização do e-mail no schema de login.
  - Status: DONE
  - Depends on: TASK-034, TASK-035
  - Escopo: Frontend
  - Critérios de aceite:
    - Aplicar `trim` ao e-mail antes de validar seu formato, aceitando credenciais cujo endereço válido contenha somente espaços externos e produzindo o e-mail normalizado no contrato de login.
    - Preservar a rejeição de e-mail vazio ou inválido, as regras atuais de senha e propriedades extras, sem alterar o serviço, a mutation ou o mapeamento de erros da autenticação.
    - Cobrir por testes de autenticação o e-mail válido com espaços externos, a saída normalizada e as rejeições existentes, sem reduzir a cobertura atual do schema, serviço ou formulário.
    - Executar testes focados de autenticação, suíte completa, typecheck, lint, build e diff-check sem falhas antes de concluir a task.
  - Evidência: commit `902c3c6`; RED 4/13 e GREEN focado 13/13 mais autenticação 40/40; gate final global 115 arquivos/747 testes; typecheck/lint/build/diff-check PASS; revisores aprovaram sem findings CRITICAL, IMPORTANT ou MINOR. A correção resolveu parte do gate externo da TASK-131.

[x] TASK-133: Eliminar rejeições não tratadas dos testes de aplicação e carrinho.
  - Status: DONE
  - Depends on: TASK-071, TASK-105
  - Escopo: Frontend
  - Critérios de aceite:
    - Eliminar as seis rejeições não tratadas observadas em `App.test.tsx` e `useConfirmedCartCount.test.tsx`, isolando cada teste e impedindo que requests ou promises sobrevivam ao seu ciclo de execução.
    - Usar `QueryClient` exclusivo de testes, com lifecycle e limpeza determinísticos, e handlers MSW intencionais para cada request exercitado pelos cenários.
    - Manter `onUnhandledRequest: 'error'`; não adicionar handlers wildcard, bypass de requests desconhecidos, supressão global de erros ou mocks que escondam falhas reais de integração.
    - Finalizar os testes afetados sem unhandled rejections, `Error` reportado pelo runner ou saída inesperada em `stderr`, preservando as asserções de comportamento de aplicação e contagem confirmada do carrinho.
    - Executar testes focados dos dois arquivos, suíte completa, typecheck, lint, build e diff-check sem falhas antes de concluir a task.
  - Evidência: commit `a14abe1`; RED do hook/App/conjunto com 3/3/6 errors e GREEN 9/9, 13/13 e 22/22; gate final global 115 arquivos/747 testes; typecheck/lint/build/diff-check PASS; revisores aprovaram sem findings CRITICAL, IMPORTANT ou MINOR. O isolamento resolveu a parte restante do gate externo da TASK-131.
