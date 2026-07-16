# TASK-107 — relatório de exploração

## Contexto e baseline

- Worktree: `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
- `BASE_COMMIT`: `d72540a` (`d72540afc8fb62146b8dbbe05480e8dc54c628b8`)
- Task confirmada como `READY`; dependências declaradas: TASK-007, TASK-042, TASK-098 e TASK-099.
- Checkout limpo durante a exploração (`git status --short` sem saída).
- Baseline focado: `npm --prefix frontend test -- src/shared/formatting/personalData.test.ts src/features/orders/routing/ordersUrl.test.ts src/features/orders/formatting/orderPresentation.test.ts src/features/customer/contracts/customerProfile.test.ts` — **4 arquivos, 54 testes, PASS**.
- Baseline de data/período com `TZ=America/Sao_Paulo` e `TZ=UTC`: `ordersUrl.test.ts` + `customerProfile.test.ts` — **2 arquivos, 27 testes, PASS em cada fuso**.

## Inventário existente

### Dados pessoais

Produto: `frontend/src/shared/formatting/personalData.ts`; testes: `personalData.test.ts`.

- CPF: normaliza caracteres não numéricos, limita em 11 dígitos e formata progressivamente até `123.456.789-01`.
- CEP: normaliza e limita em 8 dígitos e formata progressivamente até `12345-678`.
- telefone: normaliza e limita em 11 dígitos, formata progressivamente para fixo/celular e divide em `ddd`/`numero`.
- A implementação já satisfaz os vetores progressivos e os limites propostos no plano. A lacuna real é tornar explícitos os round-trips `normalize(format(input))` para entradas estranhas/sobrelongas; hoje há somente um exemplo isolado por tipo e um teste de `splitCellPhone`.

### Datas civis e pedidos

- `frontend/src/shared/dates/localCivilDate.ts` usa `getFullYear/getMonth/getDate`, portanto preserva o dia **local** em vez de derivá-lo por UTC.
- Não existe `localCivilDate.test.ts`.
- Data inválida atualmente retorna literalmente `"NaN-NaN-NaN"`; este é o RED comportamental real.
- `frontend/src/features/orders/routing/ordersUrl.test.ts` já cobre round-trip de datas civis, datas impossíveis/malformadas, páginas inseguras, períodos parciais, limites locais inclusivos e período invertido.
- Os testes de `ordersUrl` passaram em São Paulo e UTC. As expectativas por `getTime()` são corretamente independentes do offset; não se deve fixar uma string ISO com `-03:00` no teste multi-fuso.
- `frontend/src/features/orders/formatting/orderPresentation.test.ts` já cobre os cinco labels canônicos, total calculado e lista vazia. Não há lacuna da TASK-107 ali; deve permanecer no baseline de regressão, não receber comportamento novo.

### Moeda e consumidores

Não há helper compartilhado. Existem exatamente **9** instâncias locais de `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` e **13** formatações monetárias nestes consumidores:

1. `frontend/src/features/catalog/components/ProductCard.tsx` (1)
2. `frontend/src/features/catalog/pages/ProductDetailPage.tsx` (1)
3. `frontend/src/features/cart/components/CartItem.tsx` (2)
4. `frontend/src/features/cart/pages/CartPage.tsx` (2)
5. `frontend/src/features/checkout/pages/CheckoutPage.tsx` (2)
6. `frontend/src/features/checkout/pages/OrderConfirmationPage.tsx` (1)
7. `frontend/src/features/orders/components/OrderCard.tsx` (1)
8. `frontend/src/features/orders/components/OrderItem.tsx` (2)
9. `frontend/src/features/orders/pages/OrderDetailPage.tsx` (1)

Os testes dos consumidores já afirmam os valores visíveis em BRL (por exemplo `R$ 349,90`, `R$ 5.299,90`, subtotais e totais). Eles oferecem boa proteção de integração para a troca pelo helper.

## Casos RED concretos recomendados

1. Criar `frontend/src/shared/formatting/currency.test.ts` importando `./currency`: RED determinístico por módulo ausente. Casos: `0 -> R$\u00a00,00`, `-12.5 -> -R$\u00a012,50`, `1234.56 -> R$\u00a01.234,56`.
2. Criar `frontend/src/shared/dates/localCivilDate.test.ts`: meia-noite e 23:59 locais preservam o mesmo dia; `new Date(NaN)` deve lançar `RangeError`. O último caso falha hoje porque recebe `NaN-NaN-NaN`.
3. Acrescentar a `personalData.test.ts` entradas com letras/pontuação e excesso, afirmando normalização truncada e round-trip após formatação para CPF, CEP e telefone. Estes casos provavelmente já nascem GREEN; são cobertura de comportamento existente, não justificam alteração no produto.
4. Rodar a suíte focada incluindo `ordersUrl.test.ts`, `orderPresentation.test.ts`, `customerProfile.test.ts` e os testes dos nove consumidores após centralizar moeda, para provar que conteúdo e markup observável foram preservados.

## Riscos e cuidados

- **Timezone:** `localCivilDate` deve continuar usando getters locais. Não substituir por `toISOString().slice(0, 10)`. Executar seu novo teste com `TZ=America/Sao_Paulo` e `TZ=UTC`.
- **Locale/ICU:** neste runtime, `Intl` produz NBSP U+00A0 entre `R$` e o valor (`"R$\u00a00,00"`) e sinal antes da moeda (`"-R$\u00a012,50"`). O teste unitário literal deve usar `\u00a0` visível no código para evitar espaços indistinguíveis. Os matchers DOM existentes normalizam whitespace e podem continuar esperando espaço comum.
- **Markup:** a migração deve trocar apenas constantes/imports/chamadas. Não aplicar os blocos completos do plano cegamente: especialmente `CartItem.tsx`, `CartPage.tsx` e páginas possuem markup e semântica já revisados. Reescrever blocos inteiros aumenta risco de regressão de `dt/dd`, classes, nomes acessíveis e testes.
- **Telefone com +55:** o vetor sugerido pelo plano (`tel:+55 (11)...`) resulta em `55119123456`, pois a regra atual apenas extrai os primeiros 11 dígitos; ela não reconhece/remover código de país. Isso satisfaz literalmente “caracteres estranhos e limite”, mas não deve ser descrito como normalização semântica de número brasileiro. Se a intenção for remover `55`, isso é mudança de requisito/produto e está fora do plano atual.
- **Valores não finitos de moeda:** `Intl.NumberFormat` formata `NaN`/infinito em vez de rejeitar. A task pede zero, negativo, decimal e locale, não rejeição de não finitos; adicionar validação ampliaria escopo sem critério.

## Divergências/ajustes necessários no plano

- O mapa inicial da Task 107 omite `orderPresentation.test.ts`, embora a solicitação de exploração e a fronteira de apresentação de pedidos indiquem regressão focada. Incluí-lo nos gates focados é barato e coerente.
- O Step 4 lista cinco arquivos, mas não inclui os testes dos nove consumidores. Como a centralização altera todos eles, ao menos os nove arquivos de teste correspondentes devem rodar antes do gate global para capturar regressão de markup/import.
- Os testes adicionais de dados pessoais propostos não produzem RED com a implementação atual. O implementador deve registrar isso como cobertura existente adicionada em GREEN, mantendo o RED da task restrito ao módulo de moeda ausente e à data inválida.
- A instrução “implemente no início de `localCivilDate`” é adequada, porém `RangeError('Invalid local civil date')` é comportamento novo; o teste deve anteceder essa alteração.
- A matriz de evidência deve separar claramente: cobertura preexistente (`ordersUrl`, `orderPresentation`, progressivos), cobertura nova sobre comportamento existente (round-trips/entradas estranhas) e comportamento novo (`formatCurrency`, rejeição de `Invalid Date`).

## Conclusão

A TASK-107 está implementável sem mudança arquitetural. As lacunas reais são um helper monetário central para 9 consumidores/13 chamadas, teste dedicado de data civil e rejeição explícita de `Invalid Date`. CPF/CEP/telefone, URL de pedidos e apresentação de pedidos já possuem implementação correta e baseline verde; precisam apenas da evidência complementar descrita acima.
