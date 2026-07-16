---
meta:
  contentType: Reference
  title: Como executar a Fase 8 de testes e hardening
---

# Como executar a Fase 8 de testes e hardening

Este documento define como executar `TASK-106` a `TASK-130` sem duplicar cobertura existente. Ele orienta agentes que analisam, implementam e revisam cada task do frontend.

## Objetivo e audiência

O plano transforma a Fase 8 em tasks pequenas, rastreáveis e verificáveis. Cada task deve produzir evidência suficiente para distinguir cobertura já existente, lacunas reais, correções de produto e auditorias.

O documento atende três papéis:

- **Explorador**: compara os critérios com a implementação e registra lacunas antes de qualquer alteração
- **Implementador**: altera somente o escopo necessário e executa os testes definidos
- **Revisor**: verifica o diff, os critérios, as evidências e os conflitos com tasks adjacentes

## Sequência dos lotes

Execute os lotes nesta ordem:

1. `TASK-106` a `TASK-110`: cobertura determinística
2. `TASK-111` a `TASK-116`: integração com Mock Service Worker (MSW)
3. `TASK-117` a `TASK-123`: infraestrutura e jornadas Playwright
4. `TASK-124` a `TASK-129`: hardening e documentação
5. `TASK-130`: gate final

Uma task pode começar quando estiver `READY`, todas as dependências estiverem `DONE` e nenhum writer ativo alterar os mesmos componentes. No início deste plano, somente `TASK-106` a `TASK-110` podem receber `READY`. As demais permanecem `BLOCKED` até suas dependências terminarem.

## Regras de status e execução

Cada task usa um destes estados:

- **READY**: critérios definidos, dependências concluídas e componentes livres
- **IN_PROGRESS**: `BASE_COMMIT` registrado e workflow obrigatório iniciado
- **BLOCKED**: uma dependência ou conflito impede a execução
- **DONE**: implementação e revisão aprovadas, testes passam e backlog contém evidência e commits

Para cada task, registre o `BASE_COMMIT`, delegue exploração, aguarde o relatório, delegue implementação e execute os testes. Gere o diff entre `BASE_COMMIT` e `HEAD` e delegue a revisão. Findings `CRITICAL` ou `IMPORTANT` exigem correção, nova execução dos testes e nova revisão.

Não execute dois writers no mesmo checkout. Não marque uma task como `DONE` com testes falhando. Cada task deve ter um commit próprio ou um conjunto de commits identificado no backlog.

## Lote 1: cobertura determinística

Este lote fecha lacunas isoladas antes das integrações e jornadas amplas.

### TASK-106: schemas e adapters

- **Depends on**: `TASK-012`, `TASK-013`, `TASK-034`, `TASK-041`, `TASK-046`, `TASK-063`, `TASK-076`, `TASK-080`, `TASK-086`, `TASK-092`, `TASK-096`
- **Critérios**: testar `number` e string numérica em IDs e valores transportados; aceitar `null` somente onde o contrato permite; cobrir todos os enums canônicos; rejeitar valores desconhecidos, não finitos, inteiros inseguros, propriedades extras e envelopes de sucesso divergentes
- **Evidência esperada**: matriz de contratos e execução focada dos testes, sem repetir combinações equivalentes já cobertas

### TASK-107: formatadores e normalizadores

- **Depends on**: `TASK-007`, `TASK-042`, `TASK-098`, `TASK-099`
- **Critérios**: testar moeda brasileira com zero, negativo e decimal; testar CPF, Código de Endereçamento Postal (CEP) e telefone com entrada progressiva, caracteres estranhos e limites; testar datas civis locais, limites inclusivos, timezone e apresentação inválida; testar round-trip quando aplicável
- **Evidência esperada**: testes dedicados para moeda e `localCivilDate`, além do registro da cobertura existente reutilizada

### TASK-108: authStore

- **Depends on**: `TASK-032`, `TASK-033`, `TASK-037`, `TASK-039`, `TASK-040`
- **Critérios**: validar escolha e limpeza de storage; reidratar sessão válida; limpar sessão com expiração ausente, inválida ou atingida; expirar sessão ativa por timer; migrar ou descartar payload antigo e corrompido; manter o app utilizável quando o storage falhar
- **Evidência esperada**: testes focados de persistência, expiração, corrupção e migração de versão

### TASK-109: cartSessionStore

- **Depends on**: `TASK-062`, `TASK-068`, `TASK-075`, `TASK-095`
- **Critérios**: isolar IDs por cliente; alterar somente a chave alvo; descartar chaves, IDs e campos remotos inválidos; migrar a versão zero; sanitizar a versão atual corrompida; preservar uso em memória quando o `localStorage` falhar
- **Evidência esperada**: se os testes existentes cobrirem todos os critérios, executar, revisar e registrar essa prova sem alterar o produto

### TASK-110: componentes base

- **Depends on**: `TASK-019` a `TASK-026`
- **Critérios**: operar componentes por teclado; verificar foco inicial, trap, Escape e retorno de foco; cobrir estados disabled, loading, error, empty e skeleton; consultar nomes, descrições, roles, `aria-current` e regiões vivas por semântica
- **Evidência esperada**: matriz componente por critério e testes somente para células ainda descobertas

## Lote 2: integração com MSW

Este lote testa a aplicação com handlers e providers reais. Cada caso verifica request, efeito visível, cache ou rota e deve falhar quando endpoint, método, body ou reconciliação estiver incorreto.

### TASK-111: autenticação integrada

- **Depends on**: `TASK-009`, `TASK-035` a `TASK-040`, `TASK-061`, `TASK-108`
- **Critérios**: persistir login conforme a escolha; aceitar somente `returnTo` interno; limpar stores e caches no logout mesmo com falha remota; tratar `401` uma vez; impedir que requests tardios restaurem dados privados

### TASK-112: cadastro e perfil integrados

- **Depends on**: `TASK-009`, `TASK-041` a `TASK-045`, `TASK-086` a `TASK-095`, `TASK-106`, `TASK-107`
- **Critérios**: validar body normalizado e navegação após `201`; apresentar `409` sem perder valores; mapear erros conhecidos e desconhecidos de `422`; preencher o perfil por GET; confirmar mudança de CPF e reconciliar cache após PUT; não emitir sucesso em falhas

### TASK-113: catálogo integrado

- **Depends on**: `TASK-009`, `TASK-046` a `TASK-061`, `TASK-106`
- **Critérios**: iniciar categorias e catálogo em paralelo; serializar busca e página na URL e no request; usar o endpoint dedicado de categoria; seguir metadata de paginação; restaurar consulta no histórico; canonicalizar filtros inválidos; exibir estado específico para produto `404` sem retry

### TASK-114: carrinho integrado

- **Depends on**: `TASK-009`, `TASK-062` a `TASK-075`, `TASK-109`
- **Critérios**: criar carrinho sem body antes do primeiro item; ler carrinho existente; alterar quantidade por PATCH; remover após confirmação por DELETE; restaurar somente o item alvo em falhas; remover vínculo em `404`; convergir caches, badge e resposta confirmada

### TASK-115: checkout integrado

- **Depends on**: `TASK-009`, `TASK-076` a `TASK-085`, `TASK-106`, `TASK-114`
- **Critérios**: carregar carrinho e perfil confirmados; enviar somente o contrato e a data ISO; nunca enviar `clienteId` ou `carrinhoId`; usar itens confirmados; impedir POST duplicado; limpar vínculo, invalidar pedidos e navegar após `201`; preservar checkout em `409` e `422`

### TASK-116: pedidos integrados

- **Depends on**: `TASK-009`, `TASK-096` a `TASK-105`, `TASK-106`, `TASK-107`
- **Critérios**: enviar CPF, filtros e paginação corretos; capturar cliente e pedido no detalhe; hidratar produtos únicos; enviar somente `Cancelado` no PATCH; anunciar `422`, manter o status confirmado e recarregar; reconciliar detalhe e listas privadas no sucesso

## Lote 3: infraestrutura e jornadas E2E

Este lote cria jornadas de ponta a ponta (E2E) determinísticas no Chromium. `TASK-117` estabelece fixtures, handlers e isolamento compartilhados; as tasks seguintes reutilizam essa infraestrutura sem depender da ordem dos testes.

Todos os testes devem isolar storage, usar seletores semânticos e controlar a rede no browser ou por backend documentado. Cada jornada registra dados determinísticos e quantidade esperada de requests.

### TASK-117: cadastro, login, rota protegida e logout

- **Depends on**: `TASK-010`, `TASK-111`, `TASK-112`
- **Critérios**: cadastrar, receber confirmação, logar, abrir rota protegida e deslogar; verificar persistência escolhida após refresh; confirmar que logout remove o acesso protegido

### TASK-118: visitante redirecionado antes de adicionar produto

- **Depends on**: `TASK-010`, `TASK-060`, `TASK-061`, `TASK-111`, `TASK-113`
- **Critérios**: selecionar quantidade como visitante; redirecionar para `/entrar` com retorno interno exato; voltar ao produto após login; não enviar POST de carrinho antes de um novo clique

### TASK-119: adicionar, alterar e remover item

- **Depends on**: `TASK-010`, `TASK-111`, `TASK-113`, `TASK-114`, `TASK-117`
- **Critérios**: adicionar produto autenticado; confirmar badge e lista; alterar quantidade e totais; remover após confirmação; exibir carrinho vazio e badge zero; emitir cada request uma vez

### TASK-120: carrinho, checkout e confirmação

- **Depends on**: `TASK-010`, `TASK-115`, `TASK-119`
- **Critérios**: abrir checkout com carrinho não vazio; usar ou editar endereço somente para o pedido; selecionar pagamento; enviar uma vez; mostrar confirmação com resposta do servidor; consumir o carrinho

### TASK-121: dados pessoais e senha

- **Depends on**: `TASK-010`, `TASK-112`, `TASK-117`
- **Critérios**: carregar e salvar perfil; confirmar alteração de CPF; exibir regras, erros e sucesso da troca de senha; limpar valores sensíveis; confirmar o perfil salvo após refresh

### TASK-122: consulta e cancelamento recusado

- **Depends on**: `TASK-010`, `TASK-116`, `TASK-117`
- **Critérios**: listar e filtrar pedidos; abrir detalhe; receber `422` ao cancelar; anunciar a recusa; manter o status confirmado após reload

### TASK-123: sessão expirada em rota protegida

- **Depends on**: `TASK-010`, `TASK-108`, `TASK-111`, `TASK-117`
- **Critérios**: negar acesso com sessão restaurada expirada ou expirada por relógio; limpar storages e caches privados; redirecionar com retorno interno seguro; impedir que voltar ou atualizar reabra conteúdo privado

## Lote 4: hardening e documentação

Este lote mede propriedades transversais e registra resultados reproduzíveis. Auditorias podem corrigir findings dentro da task, mas não devem absorver funcionalidades novas.

### TASK-124: lazy loading

- **Depends on**: `TASK-018`, `TASK-077`, `TASK-085`, `TASK-086` a `TASK-105`
- **Critérios**: usar imports dinâmicos em checkout, confirmação, dados, senha, lista e detalhe de pedidos; manter fallback acessível e com geometria estável; gerar chunks separados; provar carregamento sob demanda
- **Evidência esperada**: verificar testes existentes e registrar inspeção do build; alterar o produto somente se algum critério falhar

### TASK-125: performance e bundle

- **Depends on**: `TASK-053`, `TASK-069`, `TASK-102`, `TASK-124`
- **Critérios**: registrar requests e chunks; eliminar waterfall entre categorias e catálogo; consultar cada produto repetido uma vez; medir e corrigir renders evitáveis relevantes; impedir imports lazy no chunk inicial; concluir build sem alertas acima do limite configurado

### TASK-126: privacidade e persistência

- **Depends on**: `TASK-032`, `TASK-039`, `TASK-040`, `TASK-062`, `TASK-084`, `TASK-095`, `TASK-108`, `TASK-109`
- **Critérios**: inventariar chaves persistidas; restringir auth à sessão e carrinho ao mapa de IDs; excluir CPF, endereço, perfil, itens e respostas do storage; limpar storages e caches privados em logout, `401` e cancelamento; rejeitar logs sensíveis; testar requests tardios

### TASK-127: responsividade

- **Depends on**: `TASK-030`, `TASK-043`, `TASK-052`, `TASK-058`, `TASK-071`, `TASK-079`, `TASK-088`, `TASK-093`, `TASK-100`, `TASK-101`
- **Critérios**: auditar rotas principais em 320, 375, 768, 1024 e 1920 px; manter `scrollWidth <= clientWidth`; permitir rolagem horizontal somente onde documentada; manter controles, dialogs e formulários utilizáveis; registrar screenshots e correções

### TASK-128: acessibilidade

- **Depends on**: `TASK-007`, `TASK-019` a `TASK-031`, `TASK-110`, `TASK-127`
- **Critérios**: concluir jornadas por teclado; verificar ordem, visibilidade e restauração de foco; validar nomes, roles, landmarks e headings; anunciar erros, status e toasts; medir contraste Web Content Accessibility Guidelines (WCAG) AA; respeitar movimento reduzido; concluir auditoria automatizada sem violações sérias e checklist manual

### TASK-129: README do frontend

- **Depends on**: `TASK-003`, `TASK-009`, `TASK-010`, `TASK-011`, `TASK-126`
- **Critérios**: documentar requisitos e versões, instalação, `VITE_API_BASE_URL`, ativação do MSW, scripts, execução com API, PostgreSQL e Docker, testes, E2E, build, troubleshooting e política de dados locais; validar comandos em checkout limpo

## Lote 5: gate final

O gate confirma o estado integrado do frontend depois de todas as tasks anteriores.

### TASK-130: gate final do MVP

- **Depends on**: `TASK-106` a `TASK-129`
- **Critérios**: executar em checkout limpo `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e` e `npm run build`; exigir exit code zero; rejeitar `.only`, erros, rejeições não tratadas e alterações pendentes; registrar contagens, duração, ambiente e commit
- **Tratamento de falha**: reabrir a task dona do comportamento; não corrigir produto diretamente em `TASK-130`

## Política para evidência existente

Uma task pode terminar sem alteração de produto quando a evidência atual satisfizer todos os critérios. O explorador deve mapear cada critério para arquivo, teste e comando reproduzível. O implementador executa esses comandos e adiciona somente a evidência ausente.

Não use contagem global de testes como prova de um critério. Não duplique casos equivalentes para aumentar cobertura. Se um critério exigir inspeção de build, viewport, contraste ou storage, registre o artefato ou relatório correspondente no backlog.

`TASK-109` e `TASK-124` são candidatas à conclusão por verificação. Essa classificação não antecipa `DONE`: exploração, execução dos testes, revisão e registro continuam obrigatórios.

## Conflitos e limites entre tasks

As fronteiras abaixo evitam duplicação e writers concorrentes:

- `TASK-106` testa contratos isolados; `TASK-111` a `TASK-116` testam wiring, request e efeito
- `TASK-107` testa formatadores; `TASK-112` e `TASK-116` usam um caso representativo por jornada
- `TASK-108` e `TASK-109` testam stores; `TASK-111`, `TASK-114`, `TASK-123` e `TASK-126` testam fronteiras e limpeza
- `TASK-110` testa primitives; `TASK-128` testa composição, contraste e jornadas completas
- `TASK-114` testa branches e rollback; `TASK-119` e `TASK-120` testam jornadas principais
- `TASK-117` define a infraestrutura E2E; `TASK-118` a `TASK-123` reutilizam seus helpers
- `TASK-124` verifica roteamento; `TASK-125` mede chunks e imports; execute-as em sequência
- `TASK-127` e `TASK-128` podem tocar CSS, layouts e primitives; não execute writers simultâneos
- `TASK-129` documenta os comandos finais; alterações de scripts exigidas pelo gate reabrem a documentação

## Gates por task e por lote

Cada task deve passar seus testes focados, typecheck e lint. Execute build quando a task alterar roteamento, imports, configuração, CSS global ou documentação de comandos. Execute E2E quando a task alterar infraestrutura Playwright ou uma jornada coberta.

Ao terminar cada lote, execute a regressão pertinente e confirme que o lote seguinte pode receber `READY`. O lote 3 exige todas as jornadas E2E no Chromium. O lote 4 exige relatórios reproduzíveis para performance, privacidade, responsividade e acessibilidade.

`TASK-130` é o único gate global. Ele não substitui os gates locais nem autoriza adiar falhas conhecidas.

## Fora de escopo

Esta fase não inclui:

- funcionalidades novas de catálogo, carrinho, checkout, conta ou pedidos
- mudanças de API, domínio ou infraestrutura backend
- suporte a navegadores além do Chromium no gate E2E
- testes visuais por comparação pixel a pixel
- metas de cobertura baseadas somente em porcentagem
- otimizações sem medição reproduzível
- reformulações de layout ou identidade visual sem finding de responsividade ou acessibilidade
- correções genéricas dentro de `TASK-130`

Qualquer necessidade fora desses limites exige uma nova task e uma decisão registrada antes da implementação.
