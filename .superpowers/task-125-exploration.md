# TASK-125 — Relatório de exploração

## Base e elegibilidade

- `BASE_COMMIT`: `7e62aad12e002ac3a6de069d42ca6e3ab32aee69`.
- A TASK-125 está `READY` e todas as dependências listadas estão `DONE`.
- Escopo exclusivo de frontend: medição de renderizações e requests, correções comprovadas por baseline e auditoria reproduzível do bundle.
- Ambiente observado: Node `v26.3.1`, npm `11.16.0`, Vite `6.4.3` e Vitest `4.1.10`.

## Baseline conhecido

- O build da TASK-124 produziu `index-BZwkBxYl.js` com `728165` bytes decimais e warning acima de 500 kB.
- Uma experiência local substituindo apenas o pipeline de top-level await pelo comportamento nativo do esbuild produziu entry de `463343` bytes. Esse valor é somente uma hipótese de direção: deve ser reproduzido por teste e build após a mudança real.
- As seis páginas lazy continuam em chunks separados:
  - `CheckoutPage`;
  - `OrderConfirmationPage`;
  - `CustomerDataPage`;
  - `CustomerPasswordPage`;
  - `OrdersPage`;
  - `OrderDetailPage`.

## Renderizações e requests

- `HomePage` inicia `useCategoriesQuery()` e a query ativa de catálogo no mesmo render. O teste existente `starts categories and the first catalog page before either request resolves` já protege contra waterfall.
- `HomePage` também possui um `useEffect` de canonicalização de URL. Em uma URL já canônica ele observa `searchParams`, embora nenhuma navegação seja necessária. A remoção ou alteração desse observer só é autorizada se o Profiler mostrar commit repetido com props, query data e estado visível iguais.
- `useCartProductsQuery` transforma itens em IDs únicos e ordenados com `Set`, memoriza o resultado e usa `ensureQueryData` em paralelo via `Promise.all`.
- `useOrderProductsQuery` também deduplica e ordena os IDs antes de formar a query key e executa `ensureQueryData` em paralelo via `Promise.all`.
- A presença da deduplicação no código não substitui evidência comportamental. Os cenários frios devem conter itens repetidos e comprovar uma request por ID único.
- `CartPage` e `OrderDetailPage` calculam mapas derivados durante render. Nenhuma memoização deve ser adicionada apenas por inspeção; otimização só entra no escopo se as cinco amostras demonstrarem commits semanticamente repetidos.
- A medição representa commits lógicos de produção e deve ser executada sem `StrictMode`, com árvore idêntica antes/depois.
- Cada cenário terá um warmup descartado e cinco amostras medidas. A ordem dos cenários será rotacionada deterministicamente para reduzir viés de aquecimento do runtime.
- Cada callback do Profiler será correlacionado a um fingerprint com `phase`, DOM/estado visível normalizado, status/dados das queries e props relevantes. Somente fingerprints consecutivos idênticos contam como commits redundantes.
- `actualDuration` é evidência sujeita a ruído, não prova isolada. A mediana final deve ser `<=` baseline pelo backlog, mas toda correção precisa também de um RED/gate semântico determinístico.
- O relatório registrará dispersão e tolerância observada. Uma inversão pequena exige um único rerun controlado do protocolo completo, sem seleção de amostras ou relaxamento do limite.
- Cada amostra deve resetar stores auth/carrinho, snapshots privados, router/history, handlers e ledgers, timers, mocks, QueryClient/cancelamento e DOM.

## Bootstrap e bundle

- `frontend/src/main.tsx` contém `await enableMocking()` no topo do módulo.
- `frontend/vite.config.ts` registra `vite-plugin-top-level-await`.
- `frontend/package.json` e `frontend/package-lock.json` mantêm `vite-plugin-top-level-await`.
- O bootstrap pode preservar a ordem “MSW antes do primeiro render” sem top-level await por meio de uma função assíncrona chamada no fim do módulo.
- A falha ao iniciar o MSW deve ser tratada explicitamente e não pode gerar rejeição não tratada. Em produção ou com MSW desabilitado, o render deve continuar normalmente.
- O teste atual de `enableMocking` cobre a decisão e o carregamento do worker, mas não cobre o contrato do bootstrap. É necessário extrair um bootstrap testável com dependências injetáveis, sem expor API de teste na aplicação.

## Grafo de imports e verificações

- O critério é mais forte que o warning do Vite: cada arquivo JavaScript inicial deve ter no máximo `500000` bytes não comprimidos.
- A auditoria deve identificar o entry pelo manifesto do Vite, percorrer apenas imports estáticos e rejeitar qualquer módulo/chunk exclusivo das seis rotas lazy alcançável a partir dele.
- Cada uma das seis rotas deve continuar com chunk próprio. A auditoria não deve depender de hashes.
- A verificação deve ser um script versionado e reproduzível, não uma leitura manual do terminal.

## Decisão de escopo

- Criar primeiro um harness de Profiler em Vitest, descartar um warmup e registrar cinco amostras baseline, no mesmo processo/ambiente, para Home, carrinho com IDs repetidos e detalhe de pedido com IDs repetidos.
- Registrar por amostra: sequência de `phase`, fingerprint semântico, `actualDuration`, `baseDuration`, quantidade de commits e requests. Calcular a mediana de `actualDuration` total e de commits.
- Preservar explicitamente o paralelismo de categorias/catálogo e das consultas de produtos, além da deduplicação por ID.
- Remover o observer redundante da Home somente se a medição confirmar commit semanticamente repetido.
- Otimizar carrinho ou pedido somente se houver commits repetidos com props, dados de query e estado visível iguais. Caso contrário, documentar “nenhuma alteração necessária”.
- Remover o top-level await do bootstrap, tratar falha do MSW, remover o plugin da configuração, dependência e lockfile, e proteger a sequência com teste RED/GREEN.
- Criar auditoria automatizada de build/grafo e manter os gates gerais. Não configurar `chunkSizeWarningLimit`, não fundir chunks lazy e não introduzir `manualChunks` sem necessidade demonstrada.
