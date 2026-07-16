# TASK-127 — Relatório de implementação da auditoria responsiva

## Escopo e commits

- BASE_COMMIT: `9f0095161597e03d5dfcf36065f36e280aa6809f`
- `e9e50e4` — auditor responsivo e primeiro RED documental.
- `6088d84` — três marcadores de overflow permitido.
- `4f7af8b` — jornada, catálogo opt-in e ledger estrito.
- `b5e701d` — correção do overflow reproduzido no carrinho.
- `594138e` — uma jornada por viewport e repetição 25/25.

## TDD e findings

O primeiro checkpoint em 320 px falhou com documento contido
(`scrollWidth=clientWidth=320`), zero offenders e `allowedMarkers=[]`, quando
era exigido `["categories"]`. Depois dos atributos documentais, o checkpoint
passou sem mudança de classes.

A matriz completa revelou um finding CSS real em `cart`, nos viewports 1024 e
1920: o container das ações “Continuar comprando” e “Ir para checkout” media
`clientWidth=270` e `scrollWidth=324`. A classe `sm:flex-row` forçava dois
botões de largura integral lado a lado dentro do resumo fixo de 20rem. A menor
correção foi manter o container em coluna. Não foi usado `overflow-x-hidden`,
tolerância, novo marcador ou redesign. Depois da correção, a matriz ficou
65/65 e `CartPage.test.tsx` ficou 18/18.

O auditor ignora conteúdo textual intrínseco de inputs e conteúdo
deliberadamente recortado por `overflow: hidden/clip`; ambos continuam sujeitos
à geometria estrita. O documento, cada scroller marcado e todos os controles
acionáveis permanecem obrigatoriamente contidos na viewport.

## Matriz 5 × 13

Cada célula abaixo foi `PASS` e gerou um attachment PNG em memória com o nome
indicado; nenhum `path` foi usado.

| Estado | 320 | 375 | 768 | 1024 | 1920 |
|---|---|---|---|---|---|
| catalog | `responsive-320-catalog` | `responsive-375-catalog` | `responsive-768-catalog` | `responsive-1024-catalog` | `responsive-1920-catalog` |
| product-detail | `responsive-320-product-detail` | `responsive-375-product-detail` | `responsive-768-product-detail` | `responsive-1024-product-detail` | `responsive-1920-product-detail` |
| login | `responsive-320-login` | `responsive-375-login` | `responsive-768-login` | `responsive-1024-login` | `responsive-1920-login` |
| registration | `responsive-320-registration` | `responsive-375-registration` | `responsive-768-registration` | `responsive-1024-registration` | `responsive-1920-registration` |
| cart | `responsive-320-cart` | `responsive-375-cart` | `responsive-768-cart` | `responsive-1024-cart` | `responsive-1920-cart` |
| cart-remove-dialog | `responsive-320-cart-remove-dialog` | `responsive-375-cart-remove-dialog` | `responsive-768-cart-remove-dialog` | `responsive-1024-cart-remove-dialog` | `responsive-1920-cart-remove-dialog` |
| checkout | `responsive-320-checkout` | `responsive-375-checkout` | `responsive-768-checkout` | `responsive-1024-checkout` | `responsive-1920-checkout` |
| order-confirmation | `responsive-320-order-confirmation` | `responsive-375-order-confirmation` | `responsive-768-order-confirmation` | `responsive-1024-order-confirmation` | `responsive-1920-order-confirmation` |
| account-data | `responsive-320-account-data` | `responsive-375-account-data` | `responsive-768-account-data` | `responsive-1024-account-data` | `responsive-1920-account-data` |
| account-password | `responsive-320-account-password` | `responsive-375-account-password` | `responsive-768-account-password` | `responsive-1024-account-password` | `responsive-1920-account-password` |
| orders-list | `responsive-320-orders-list` | `responsive-375-orders-list` | `responsive-768-orders-list` | `responsive-1024-orders-list` | `responsive-1920-orders-list` |
| order-detail | `responsive-320-order-detail` | `responsive-375-order-detail` | `responsive-768-order-detail` | `responsive-1024-order-detail` | `responsive-1920-order-detail` |
| order-cancel-dialog | `responsive-320-order-cancel-dialog` | `responsive-375-order-cancel-dialog` | `responsive-768-order-cancel-dialog` | `responsive-1024-order-cancel-dialog` | `responsive-1920-order-cancel-dialog` |

Resultado: 5 jornadas, 13 estados literais por jornada, 65/65 checkpoints e
65 screenshots por execução.

## Overflow permitido

O conjunto global observado foi exatamente:

1. `categories`
2. `account-navigation`
3. `pagination`

Marcador desconhecido, duplicado ou excedente falha com o diagnóstico completo.
Os descendants largos dos scrollers não são offenders internos, mas o próprio
scroller continua obrigado a permanecer dentro do documento.

## Controles e fluxos acionados

- Login e cadastro: campos preenchidos e limpos, sem cadastro.
- Produto: quantidade 3, tentativa visitante sem mutation, login pela UI e
  segundo clique autenticado.
- Carrinho: item e quantidade confirmados; dialog de remoção auditado e fechado
  por “Cancelar”, sem DELETE.
- Checkout: endereço exclusivo do pedido, Cartão e uma confirmação.
- Conta: nome restaurado sem PUT; senhas preenchidas e limpas sem PUT.
- Pedidos: datas restauradas sem filtro; detalhe aberto; dialog de cancelamento
  auditado e fechado por “Voltar”, sem PATCH.

## Ledger estrito

O objeto abaixo foi idêntico nos cinco viewports:

```json
{
  "register": 0,
  "login": 1,
  "categories": 5,
  "catalog": 1,
  "profile": 3,
  "profileUpdate": 0,
  "passwordUpdate": 0,
  "logout": 0,
  "product": 3,
  "cartCreate": 1,
  "cartAdd": 1,
  "cartGet": 2,
  "cartUpdate": 0,
  "cartDelete": 0,
  "orderCreate": 1,
  "ordersList": 1,
  "orderDetail": 1,
  "orderProduct": 1,
  "orderCancel": 0
}
```

O catálogo paginado é opt-in, usa o contrato estrito atual
(`thumb`, sem campos extras rejeitados pelo schema) e volta ao catálogo vazio
em `reset()`. Nenhuma outra spec ativa esse modo.

## Estabilidade, custo e gates

- Matriz serial final: 5/5 em 32,8 s.
- Anti-flake: 25/25 jornadas, 325 checkpoints/attachments, em 2,6 min.
- Shard 1/5: viewport 320, 1/1 em aproximadamente 10,1 s.
- Shard 5/5: viewport 1920, 1/1 em aproximadamente 9,1 s.
- Suíte Chromium: 14/14 em 18,2 s.
- Suíte Chromium `--repeat-each=2`: 28/28 em 31,8 s.
- Componentes dos marcadores: 18/18.
- `CartPage.test.tsx`: 18/18.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test`: 129 arquivos, 856/856 testes.
- `npm run build`: PASS; chunk inicial `464.68 kB`, abaixo de 500 kB.
- `git diff --check 9f00951..HEAD`: PASS.
- `git ls-files "*.png" "frontend/test-results/**" "frontend/playwright-report/**"`:
  zero resultados.
- Worktree limpo antes da criação deste relatório.

Ambiente: Windows/PowerShell, Chromium Playwright 1.61, Vite em modo de
produção E2E, timezone `America/Sao_Paulo`.
