# TASK-125 — Auditoria de performance

## Ambiente e protocolo

- Base funcional: `7e62aad12e002ac3a6de069d42ca6e3ab32aee69`.
- Node `v26.3.1`, npm `11.16.0`, Vite `6.4.3`, Vitest `4.1.10`.
- React Profiler sem `StrictMode`, um warmup descartado e cinco amostras frias.
- Ordem rotacionada: Home → carrinho → pedido; carrinho → pedido → Home; pedido → Home → carrinho.
- Cada amostra recriou router e QueryClient e limpou sessão, vínculos de carrinho, snapshots privados, handlers, timers, mocks e DOM.
- Fingerprint: phase, DOM visível normalizado, queries ordenadas com status/fetchStatus/data e props relevantes.

## Baseline e resultado

Não houve alteração nos componentes medidos: nenhum cenário apresentou fingerprints consecutivos idênticos. Por isso o resultado final é o próprio baseline imutável e as medianas não sofreram regressão.

| Cenário | Commits (5 amostras) | Duração total em ms (5 amostras) | Mediana commits | Mediana ms | Mín.–máx. ms | Redundantes |
|---|---|---|---:|---:|---:|---|
| Home | 2, 2, 2, 2, 2 | 18,4410; 15,5829; 17,7773; 19,3846; 15,1650 | 2 | 17,7773 | 15,1650–19,3846 | 0, 0, 0, 0, 0 |
| Carrinho | 5, 5, 5, 5, 5 | 23,1429; 25,1589; 25,0031; 24,9446; 24,6640 | 5 | 24,9446 | 23,1429–25,1589 | 0, 0, 0, 0, 0 |
| Pedido | 4, 4, 4, 4, 4 | 18,6799; 19,0437; 22,8792; 19,4053; 17,5528 | 4 | 19,0437 | 17,5528–22,8792 | 0, 0, 0, 0, 0 |

Classificação: `NÃO CONFIRMADO` para Home, carrinho e detalhe do pedido. `actualDuration` apresentou dispersão esperada do ambiente jsdom, mas não foi usado isoladamente para autorizar otimizações.

As medições acima substituem a execução inicial, cuja revisão detectou dois defeitos de evidência: o primeiro callback podia observar referências ainda não atribuídas e o DOM era reduzido somente a texto. O protocolo corrigido cria container e QueryClient antes do render; todo callback recebe um snapshot pós-commit válido ou falha explicitamente. A serialização registra tag, role, nome acessível, texto terminal, disabled, checked, value e estados ARIA relevantes, além de status/fetchStatus/data das queries e props.

## Requests e estados visíveis

- Home, em todas as amostras: `GET /api/v1/categoria` e `GET /api/v1/produto?page=1&size=20`; ambas iniciam na mesma carga, e o catálogo exibe “Teclado mecânico”.
- Carrinho, em todas as amostras: uma leitura de carrinho e exatamente `GET /api/v1/produto/5` e `GET /api/v1/produto/9` para itens `[5, 5, 9]`; três itens continuam visíveis.
- Pedido, em todas as amostras: uma leitura do pedido e exatamente `GET /api/v1/produto/5` e `GET /api/v1/produto/9` para itens `[5, 5, 9]`; status, três itens e total continuam visíveis.
- `Promise.all`, IDs únicos, query keys estáveis e `ensureQueryData` foram preservados.

## Bootstrap

- `bootstrap()` aguarda MSW antes do primeiro render e renderiza exatamente uma vez.
- Falha do worker é reportada e o render continua, sem rejeição não tratada.
- A ausência de `#root` mantém a mensagem existente.
- `main.tsx` não possui top-level await.

## Bundle e grafo

- Baseline conhecido: entry `728165` bytes.
- Referência experimental anterior: `463343` bytes.
- Resultado produzido: `assets/index-C2exe1TL.js`, `464141` bytes não comprimidos, abaixo do limite de `500000`.
- Seis chunks lazy distintos:
  - `CheckoutPage-DBDZ2LQ3.js`
  - `OrderConfirmationPage-I6jSG9gW.js`
  - `CustomerDataPage-CXKZOWcd.js`
  - `CustomerPasswordPage-D3Y0r7zM.js`
  - `OrdersPage-xHMtAEKW.js`
  - `OrderDetailPage-D_G2K3eT.js`
- O fecho de imports estáticos do entry contém somente o entry; nenhuma das seis sources lazy é alcançável estaticamente.
- O verificador possui teste negativo que prova a falha `exceeds 500000 bytes`.
- `vite-plugin-top-level-await` foi removido da configuração, `package.json` e lockfile.

## Gates

- Focados antes da correção: 44/44; testes específicos dos fingerprints corrigidos: 3/3.
- Suíte completa após correção: 850/850, executada sem concorrência com build para não introduzir contenção artificial nos imports lazy.
- Typecheck e lint: PASS.
- Build e verificador do grafo: PASS.
- E2E Chromium: 9/9.
