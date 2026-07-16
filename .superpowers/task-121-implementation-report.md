# TASK-121 — Relatório de implementação

## Escopo e baseline

- `BASE_COMMIT`: `9838c65e3e7eef320fada1a252a660bc211ee43d`
- Branch: `codex/phase-8-hardening`
- Escopo alterado:
  - `frontend/e2e/support/authApi.ts`
  - `frontend/e2e/account.spec.ts`
- Nenhum código de produto, backend ASP.NET ou backlog foi alterado pela implementação.

## Commits

- `ed6f75d` — `test(TASK-121): Estender backend E2E para conta`
- `a3a7114` — `test(TASK-121): Cobrir jornada E2E da conta`

## TDD

1. A jornada E2E foi escrita antes dos endpoints mutáveis.
2. O RED comportamental falhou no primeiro `PUT /api/v1/cliente/{id}` porque o
   helper aceitava somente `GET`.
3. Foram adicionados handlers estritos para atualização de perfil e senha,
   contadores dedicados e reset do estado mutável.
4. O tráfego real confirmou que a atualização de perfil mantém o CEP formatado;
   a expectativa do helper foi alinhada ao contrato já provado pelos testes de
   integração, sem mudança de produto.
5. O GREEN focado passou com as contagens:

```text
register=0 login=1 categories=3 profile=3 profileUpdate=1 passwordUpdate=2
logout=0 product=0 cartCreate=0 cartAdd=0 cartGet=0 cartUpdate=0
cartDelete=0 orderCreate=0
```

## Evidência funcional

- Login realizado pela UI, retornando para `/minha-conta/dados`.
- Perfil inicial carregado do backend determinístico.
- Alteração de CPF abre confirmação com os valores atual e novo mascarados.
- Nenhum PUT de perfil ocorre antes da confirmação explícita.
- PUT de perfil valida token e body exato, sem `clienteId`, `senha` ou campos
  extras.
- Perfil aceito é reconciliado e permanece após `page.reload()`.
- As quatro regras de senha e seus estados são verificadas semanticamente.
- Tentativa local inválida não emite request.
- Primeira tentativa HTTP recebe `422`, preserva a senha atual e limpa a nova.
- Segunda tentativa é aceita e limpa ambos os campos sensíveis.
- Uma terceira tentativa é rejeitada explicitamente pelo helper.
- `customerSnapshot()` continua sem expor senha.

## Gates executados

Antes da estabilização da TASK-120, uma repetição completa encontrou a contagem
intermitente de categorias no checkout. O blocker foi resolvido e revalidado
pelos commits:

- `2a63572` — estabilização da contagem E2E do checkout;
- `52125c4` — atualização da rastreabilidade da TASK-120.

Após esses commits:

```text
npm --prefix frontend run test:e2e -- account.spec.ts \
  --project=chromium --repeat-each=20
PASS — 20/20

npm --prefix frontend run test:e2e -- --project=chromium --repeat-each=2
PASS — 12/12

npm --prefix frontend run typecheck
PASS

npm --prefix frontend run lint
PASS

npm --prefix frontend run build
PASS — 387 módulos transformados

git diff --check 9838c65..HEAD
PASS
```

O build preserva o warning preexistente de chunk principal acima de 500 kB,
sem falha do gate.

## Resultado

A TASK-121 possui implementação e evidência reproduzível para edição de dados,
confirmação de CPF, persistência após refresh, regras/erros/sucesso da troca de
senha, limpeza de valores sensíveis e contagens exatas de requests. A atualização
do status no backlog permanece responsabilidade do orquestrador após a revisão
independente.
