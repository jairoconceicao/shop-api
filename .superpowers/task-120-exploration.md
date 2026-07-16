# Exploração da TASK-120 — carrinho, checkout e confirmação E2E

**BASE_COMMIT:** `746925c7e088de40432d2cf0f1d2a82521ee0b4f`
**Branch/worktree:** `codex/phase-8-hardening` em `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
**Modo:** exploração read-only do produto; somente este relatório foi criado.

## Elegibilidade e baseline

- `TASK-117`, `TASK-118` e `TASK-119` estão concluídas.
- `TASK-120` está elegível e todas as dependências listadas estão concluídas.
- O checkout estava limpo no início da exploração e `HEAD` era o
  `BASE_COMMIT`.
- O plano aprovado é
  `docs/superpowers/plans/2026-07-16-task-120-checkout-e2e.md`.
- A infraestrutura E2E compartilhada já fornece isolamento por teste,
  interceptação estrita, teardown e ledger exato de requests.

## Conclusão

A task é implementável sem alteração de produto ou backend ASP.NET. A lacuna
está restrita ao backend Playwright em memória e a uma nova spec:

1. `frontend/e2e/support/authApi.ts` ainda não reconhece a criação de pedido,
   não expõe snapshot imutável do cliente e não possui dados determinísticos de
   confirmação.
2. Não existe `frontend/e2e/checkout.spec.ts`.
3. A jornada pode montar o carrinho exclusivamente pela UI, entrar no checkout
   pelo link real e verificar a confirmação retornada pelo interceptador.

## Colocações exatas

Em `frontend/e2e/support/authApi.ts`:

- ampliar `RequestName` e o ledger com `orderCreate`;
- incluir `orderId` nos dados determinísticos;
- expor `customerSnapshot()` como cópia somente leitura;
- interceptar `POST /api/v1/pedido` com autenticação e body estritos;
- rejeitar `clienteId` e `carrinhoId`, validar `dataPedido` ISO com offset e
  aceitar somente o endereço editado para o pedido e `Cartao`;
- devolver `201` com identificador, status e total determinísticos;
- consumir o item do carrinho somente após a criação válida.

Criar `frontend/e2e/checkout.spec.ts` para provar:

- entrada protegida, login e carrinho não vazio montado pela UI;
- edição do endereço limitada ao pedido e perfil persistido inalterado;
- seleção de cartão;
- duas submissões síncronas observáveis e apenas um POST;
- confirmação exata baseada na resposta do servidor;
- badge zerado e carrinho vazio após a confirmação.

Não alterar:

- `frontend/src/**`;
- backend ASP.NET;
- `docs/frontend-tasks-v2.md`;
- backlog ou status da task durante a implementação.

## Contrato e contagens esperadas

O pedido deve conter somente `enderecoEntrega`, `formaPagamento`,
`dataPedido` e `items`. O item usa os identificadores e valores confirmados do
carrinho; o total esperado é `3 × 3499.9 = 10499.7`.

```text
register=0
login=1
categories=2
catalog=1
profile=1
logout=0
product=2
cartCreate=1
cartAdd=1
cartGet=2
cartUpdate=0
cartDelete=0
orderCreate=1
```

As duas leituras de categorias correspondem à home exibida depois do login e à
carga completa iniciada por `page.goto` no produto. A única leitura de catálogo
corresponde à home e é validada pelo backend E2E com query exata
`?page=1&size=20`. As duas leituras do carrinho correspondem à ativação após
criar o vínculo e à reconciliação do item adicionado. O checkout reutiliza o
cache confirmado.

Ao final, o link sem badge armazenado em `emptyCartLink` faz navegação SPA para
`/carrinho` e reutiliza layout e cache. Portanto essa ação não causa nova
leitura de categorias nem um novo GET do carrinho.

## Reabertura por flake

Uma verificação posterior com `--repeat-each=20` reproduziu 5 falhas em 20
execuções: o ledger recebeu `categories=2` quando esperava `3`. A entrada por
`/carrinho` montava `StoreLayout` e iniciava a consulta de categorias antes de
`ProtectedRoute` redirecionar o visitante para `/entrar`; a navegação podia
cancelar a consulta antes ou depois de o interceptador contabilizá-la.

A correção determinística inicia diretamente em `/entrar`, autentica pela UI,
espera as consultas paralelas e estritamente declaradas de categorias e
catálogo da home, confirma a navegação padrão para `/` e só então faz carga
completa do produto. Assim, nenhuma contagem depende de uma requisição
cancelada ou ignorada.

## Evidência RED prevista

Antes do handler de pedido, executar:

```text
npm --prefix frontend run test:e2e -- checkout.spec.ts --project=chromium
```

deve falhar no limite estrito do backend E2E com request inesperado para
`POST /api/v1/pedido`. Essa é a prova comportamental de que a jornada alcança a
criação real do pedido e que o suporte ainda não a implementa.

## Cuidados

- Executar Playwright e lint sequencialmente para evitar a corrida já observada
  sobre `frontend/test-results`.
- Manter o handler de pedido antes de matches mais amplos.
- Só consumir o carrinho depois de validar integralmente o request.
- Preservar reset e isolamento para `fullyParallel` e `--repeat-each`.
