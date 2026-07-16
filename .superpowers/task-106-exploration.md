# TASK-106 — exploração de schemas e adapters

## Status e escopo

- **BASE_COMMIT:** `3c7e575b60a7ef1c613c54c72ab844765567b68b`
- **Elegibilidade:** `READY`; todas as dependências declaradas estão concluídas no backlog.
- **Inspeção:** read-only sobre produto, backlog e Git. Este relatório é o único arquivo criado.
- **Baseline focada:** `npm --prefix frontend test -- src/shared/adapters/numbers.test.ts src/shared/contracts/apiEnvelopes.test.ts src/features/auth/contracts/login.test.ts src/features/catalog/contracts/catalog.test.ts src/features/cart/contracts/cart.test.ts src/features/checkout/contracts/checkout.test.ts src/features/checkout/contracts/order.test.ts src/features/customer/contracts/registration.test.ts src/features/customer/contracts/customerProfile.test.ts src/features/orders/contracts/orders.test.ts` → **10 arquivos / 168 testes PASS**, exit `0`.

## Conclusão executiva

O plano identifica corretamente a principal lacuna de produto: schemas Zod não estritos e schemas numéricos que aceitam `number` inseguro ou não finito antes de o adapter normalizar. Porém, os blocos de teste propostos repetem bastante cobertura já existente e não demonstram literalmente o critério mais amplo de “todos os IDs e valores transportados”. O implementador deve usar uma matriz por campo e acrescentar somente as células ausentes.

A mudança mínima de produto esperada é:

1. tornar envelopes, paginação e objetos transportados estritos;
2. trocar IDs numéricos por `z.number().int().safe()`;
3. trocar números de transporte por `z.number().finite()`;
4. preservar nulabilidade apenas onde o contrato a declara;
5. não alterar regras de domínio já aplicadas nos adapters (positivo/não negativo).

## Interfaces reais conferidas

| Área | Interface real | Estado atual | Lacuna comprovável |
| --- | --- | --- | --- |
| Numbers | `normalizeNumber(number|string)` | Rejeita vazio, texto, `Infinity`, `NaN`; aceita decimal/negativo | Falta teste explícito para `-Infinity`; implementação já rejeita |
| Numbers | `normalizeId(number|string)` | Rejeita fração e string unsafe | Falta teste explícito para `Number.MAX_SAFE_INTEGER + 1`; implementação já rejeita |
| Envelopes | `createApiResponseSchema` | `data` opcional e nullable; objeto não estrito | Aceita propriedades extras no envelope |
| Envelopes | `createPagedResponseSchema` | inteiros number/string; campos opcionais | Aceita propriedades extras; `number` unsafe passa pelo schema |
| Error envelope | `apiErrorResponseSchema` | campos opcionais, `details: unknown` | Envelope e objeto `error` aceitam extras |
| Login | `adaptLoginResponse` | normaliza ambos IDs; rejeita ausência/null/status false | request, data e envelope aceitam extras; IDs `number` unsafe passam pelo schema e só falham depois |
| Catálogo | três adapters públicos | number/string e nulls já cobertos parcialmente | objetos não estritos; `number` não finito passa no schema; unsafe IDs só falham no adapter |
| Carrinho | requests e cinco adapters públicos | boa cobertura de number/string, null, envelope inválido e não finito | schemas internos de resposta não são estritos; IDs usam `.int()` sem `.safe()` |
| Checkout | `paymentMethodSchema`, `checkoutFormSchema` | enum canônico e root estrito já cobertos | nenhum RED esperado para enum/root; apenas evitar duplicação |
| Criação de pedido | dois adapters públicos | root/item/response estritos e várias regras já cobertas | transport schemas aceitam unsafe/non-finite antes do adapter; `itemId: null` permitido pelo OpenAPI |
| Cadastro | request/response adapters | null do envelope e ID string já cobertos | request e objetos aninhados aceitam extras; ID number unsafe só falha no adapter |
| Perfil | três adapters + projeção | root/envelope/nested strict já implementados; extra e null já testados | falta prova específica de ID unsafe em string/number; não há RED de strictness esperado |
| Pedidos | página, detalhe, cancelamento | todos os envelopes/objetos já strict; status inválido e unsafe/non-finite já testados | falta iterar literalmente todos os cinco status e os três pagamentos; transport schemas ainda não usam `.safe()`/`.finite()` |

## Cobertura existente que não deve ser duplicada

- `numbers.test.ts` já cobre `Infinity`, `NaN`, frações e string unsafe.
- `login.test.ts` já cobre IDs string, `data: null`, `status: false` e transporte malformado.
- `catalog.test.ts` já cobre IDs/números string, números nativos em categoria, null de descrição/thumb/descrição/foto e envelopes incompletos.
- `cart.test.ts` já cobre strings/numbers, requests com extra, `NaN`, infinidades, ID unsafe, datas inválidas e todos os adapters de resposta.
- `checkout.test.ts` já aceita `Pix`, `Cartao`, `Boleto`, rejeita enum externo, valida `complemento` `undefined|null|string` e root/endereço estritos.
- `order.test.ts` já cobre root/item estritos, normalização de todos os campos numéricos, null obrigatório de `itemId`, status canônico/externo, unsafe ID e total não finito.
- `registration.test.ts` já cobre request completo, nested obrigatórios, envelope nullable e ID string inválido.
- `customerProfile.test.ts` já cobre envelope/root/nested estritos, null, ID positivo, forma normalizada e extras.
- `orders.test.ts` já cobre página/detalhe/cancelamento estritos, ID unsafe, número não finito, status desconhecido e envelopes divergentes.

## Testes RED propostos (somente lacunas)

### 1. Shared envelopes

Em `frontend/src/shared/contracts/apiEnvelopes.test.ts`:

- rejeitar extra no envelope de sucesso;
- rejeitar extra no objeto `pagination`;
- rejeitar extra no envelope de erro e no objeto `error`;
- rejeitar `Number.MAX_SAFE_INTEGER + 1` em `pages`, `size` e `totalItems` (tabela por campo).

Esses casos devem ficar RED hoje. Não repetir os testes atuais de nullable/opcionais/frações.

### 2. Strictness por contrato ainda permissivo

Adicionar uma tabela de propriedade extra por nível:

- `login.test.ts`: request, response `data`, envelope;
- `catalog.test.ts`: categoria, categoria aninhada, item de catálogo, detalhe, paginação, envelope;
- `cart.test.ts`: cada response data e item interno (requests já são strict);
- `registration.test.ts`: request, endereço, celular, response data e envelope.

`customerProfile`, `checkout`, `create-order` e `orders` já são strict e devem ser registrados como cobertura reutilizada, não como RED previsto.

### 3. Matriz numérica por campo

Para satisfazer “todos os IDs e valores”, parametrizar por construtor de fixture/campo e provar ao menos:

- um valor `number` válido e sua string numérica equivalente;
- unsafe para cada ID;
- `NaN`, `Infinity`, `-Infinity` para cada valor decimal;
- fração para cada ID.

Campos a enumerar: login `usuarioId/clienteId`; catálogo `categoriaId/produtoId/preco/estoque/pages/size/totalItems`; carrinho `clienteId/carrinhoId/itemId/produtoId/quantidade/valorUnitario`; cadastro/perfil `clienteId`; criação de pedido `itemId/produtoId/quantidade/valorUnitario/pedidoId/clienteId/valorTotal`; pedidos `pedidoId/carrinhoId/clienteId/itemId/produtoId/quantidade/valorUnitario/pages/size/totalItems`; cancelamento `pedidoId/clienteId`.

Para reduzir volume, a matriz pode usar helpers locais e reutilizar a mesma expectativa por campo. O relatório final deve apontar testes anteriores quando uma célula já estiver comprovada.

### 4. Enums

- `checkout.test.ts` já prova os três meios de pagamento; apenas ampliar rejeitados para casing/acentuação/null se desejado.
- `orders.test.ts` deve importar `orderStatuses` e `orderStatusSchema` e iterar os cinco valores literais; hoje apenas `Criado`/`Devolvido` aparecem em caminhos felizes.
- Validar também meios de pagamento nos adapters de pedido, sem redefinir listas paralelas.

### 5. Nulabilidade

Registrar por campo, não apenas por fixture. O OpenAPI permite `null` explicitamente em `ApiResponse.data`, `EnderecoRequest.complemento`, `PedidoItemRequest.itemId`, `ProdutoCatalogoItemResponse.thumb` e campos nullable do detalhe do produto. Os adapters podem rejeitar `data: null` como resposta semanticamente malsucedida mesmo que o schema de envelope a aceite.

## Divergências e correções necessárias no plano

1. **O RED esperado está superestimado.** `customerProfile`, `checkout`, `create-order` e `orders` já são estritos. Os blocos propostos nesses arquivos tendem a passar imediatamente.
2. **Há duplicação contrária ao aceite.** Vários fixtures literais repetem testes existentes quase integralmente. A implementação deve primeiro preencher a matriz e só escrever células vazias.
3. **A matriz “uma linha por schema/adaptador” é insuficiente para “todos os IDs e valores”.** Ela precisa ter uma linha por campo transportado ou uma coluna que liste campos e evidências individualmente.
4. **`apiErrorResponseSchema` aparece na implementação sugerida, mas não há bloco RED correspondente no plano.** Se o produto for tornado strict, deve existir teste que justifique a mudança.
5. **`categorySchema.descricao` diverge do `openapi.yaml`.** No OpenAPI inspecionado, `CategoriaResponse.descricao` é `type: string`, sem `null`; o código, os testes existentes e o snippet do plano aceitam `null`. Como o backlog declara OpenAPI como fonte de verdade e exige null somente onde permitido, o implementador não deve preservar esse null silenciosamente. É necessária decisão explícita: alinhar schema/teste ao OpenAPI ou registrar uma divergência contratual/backend separada. Não alterar sem registrar a decisão.
6. **Strictness não vem do OpenAPI por si só.** O documento não declara `additionalProperties: false`; rejeitar extras é, contudo, critério explícito da TASK-106. O relatório deve atribuir essa regra à task, não alegar que é gerada pelo OpenAPI.
7. **A mudança de `.int()` para `.int().safe()` e de `z.number()` para `z.number().finite()` é correta**, mas os adapters já fornecem uma segunda barreira. Testes devem verificar rejeição na interface pública; não acoplar a mensagens específicas de Zod.
8. **O snippet de `createdOrderResponseSchema` repete o envelope em vez de usar o helper compartilhado.** Isso é compatível hoje e já strict, mas cria duas definições equivalentes. Não refatorar nesta task sem necessidade demonstrada.

## Riscos de regressão

- Tornar envelopes estritos pode rejeitar campos adicionais enviados por versões futuras do backend; é intencional pelo aceite, mas impacta login, catálogo, carrinho e cadastro simultaneamente.
- Tornar objetos de request estritos pode revelar que forms/serviços enviam campos visuais; executar serviços/mutations focados após GREEN, além dos contratos.
- Alterar nulabilidade de `CategoriaResponse.descricao` pode quebrar fixture e UI que hoje tratam null. Exige decisão contratual explícita.
- Schemas genéricos continuam com campos opcionais porque o OpenAPI os declara opcionais; adapters públicos fazem o gate de sucesso. Torná-los obrigatórios seria expansão de escopo e poderia quebrar respostas válidas segundo a fonte.
- Não trocar validações de positivo/não negativo dos adapters por mera validação de transporte; são regras adicionais já cobertas em pedidos/perfil.
- Zod remove extras por padrão; ao mudar para `.strict()`, testes que hoje só comparam resultado sem extra não detectam a alteração. Todo nível alterado precisa de RED próprio.

## Arquivos esperados para a implementação

Testes/matriz: os dez arquivos listados no plano e `docs/frontend-quality/task-106-contract-matrix.md`, com mudanças condicionadas às lacunas acima.

Produto após RED: `apiEnvelopes.ts`, `login.ts`, `catalog.ts`, `cart.ts`, `registration.ts` certamente; `checkout.ts`, `order.ts`, `customerProfile.ts` e `orders.ts` apenas para `.safe()`/`.finite()` comprovados, não para strictness já presente.

## Gate recomendado ao implementador

1. preservar o baseline de 168/168;
2. capturar RED por grupo (strictness, unsafe/non-finite, enum/status);
3. aplicar mudança mínima;
4. rodar os dez arquivos focados, typecheck e lint;
5. por risco transversal dos envelopes, rodar também testes de services/mutations que consomem os adapters antes da revisão.
