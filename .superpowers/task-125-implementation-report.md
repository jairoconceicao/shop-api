# TASK-125 — Relatório de implementação

## Escopo entregue

- Harness de performance com React Profiler, warmup descartado, cinco amostras rotacionadas, fingerprints semânticos e ledger de requests.
- Baseline comprovou zero commits consecutivos redundantes em Home, carrinho e detalhe de pedido; nenhum desses componentes foi alterado.
- Bootstrap assíncrono testável sem top-level await, com MSW antes do render, render único e falha do worker tratada.
- Remoção completa de `vite-plugin-top-level-await`.
- Manifesto Vite habilitado e verificador testado do grafo de produção.
- Entry reduzido de 728165 para 464141 bytes, com seis rotas lazy distintas e fora do fecho estático.

## TDD e decisões

- Bootstrap: RED por módulo ausente; GREEN cobriu ordem, render único, erro do worker, ausência de unhandled rejection e raiz ausente.
- Verificador: RED por módulo ausente; GREEN inclui teste negativo de arquivo inicial com 500001 bytes.
- Componentes medidos não foram otimizados porque o critério determinístico de redundância não foi satisfeito.
- Deduplicação `[5, 5, 9] -> requests 5 e 9`, paralelismo da Home, `Promise.all`, `Set`, query keys e `ensureQueryData` foram preservados.
- A revisão revelou que a evidência inicial podia gerar snapshot vazio no primeiro commit e perdia atributos interativos. O RED comprovou ambos os problemas. O GREEN passou a preparar container/QueryClient antes do render, rejeitar contexto incompleto e serializar tag, role, nome, texto, disabled, checked, value e ARIA relevantes.
- O protocolo warmup + cinco amostras foi repetido após a correção. Continuaram sem fingerprints consecutivos repetidos: Home 2 commits/17,7773 ms, carrinho 5/24,9446 ms e pedido 4/19,0437 ms de mediana.

## Commits

- `f99332c` — `perf(TASK-125): Remover await do bootstrap`
- `e90247d` — `perf(TASK-125): Reduzir grafo JavaScript inicial`
- `0f84086` — `test(TASK-125): Medir baseline de renderizações`

## Verificação

- Testes focados: 44/44.
- Typecheck: PASS.
- Lint: PASS.
- Suíte completa após correção: 850/850.
- `audit:performance`: PASS; entry 464141 bytes, seis chunks lazy distintos.
- E2E Chromium: 9/9.
- O primeiro gate completo executado em paralelo com build teve um timeout de 1 s no import lazy do checkout. O teste passou isolado após encerrar a contenção e a suíte completa foi repetida sozinha com 848/848.
