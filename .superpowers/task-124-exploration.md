# TASK-124 — Relatório de exploração

## Base e elegibilidade

- `BASE_COMMIT`: `6fbac40f1aac9ee806bec103e4cf7110366be237`.
- A TASK-124 está `READY` e todas as dependências listadas estão `DONE`.
- O escopo é exclusivamente frontend e a task determina verificação primeiro: alterar o produto somente quando um critério falhar.

## Fatos observados

- `frontend/src/app/router/AppRouter.tsx` já usa `React.lazy` com `import()` separado para:
  - `CheckoutPage`;
  - `OrderConfirmationPage`;
  - `CustomerDataPage`;
  - `CustomerPasswordPage`;
  - `OrdersPage`;
  - `OrderDetailPage`.
- Dados pessoais, senha, lista de pedidos e detalhe de pedido já possuem fallback com `role="status"`, nome acessível, `aria-live="polite"` e `min-h-96`.
- Checkout e confirmação compartilham `CheckoutRouteFallback`. Esse fallback tem `role="status"` e nome acessível, mas não reserva geometria com `min-h-96`.
- A confirmação não possui fallback específico: durante seu carregamento, a região é anunciada como `Carregando checkout`.
- `frontend/src/app/router/AppRouter.lazy.test.tsx` prova checkout, dados, senha, pedidos e detalhe sob demanda. Não prova a rota de confirmação e não exige geometria estável do checkout.
- O build no BASE_COMMIT passou com Vite 6.4.3, 388 módulos transformados e produziu chunks separados:
  - `CheckoutPage-*.js`;
  - `OrderConfirmationPage-*.js`;
  - `CustomerDataPage-*.js`;
  - `CustomerPasswordPage-*.js`;
  - `OrdersPage-*.js`;
  - `OrderDetailPage-*.js`.
- O entry inicial foi `index-*.js` com 727,79 kB e gerou o warning de chunk acima de 500 kB. Esse limite pertence explicitamente à TASK-125; não deve ser corrigido ou mascarado na TASK-124.
- Nomes de navegação como `Meus pedidos` e `Dados pessoais` também existem no shell inicial, portanto não servem como marcadores de ausência. A auditoria deve usar cópias exclusivas de cada página:
  - checkout: `Não foi possível confirmar o pedido`;
  - confirmação: `Pedido criado`;
  - dados: `Meus dados`;
  - senha: `Senha alterada com sucesso.`;
  - pedidos: `Nenhum pedido encontrado`;
  - detalhe: `O cancelamento não foi aceito`.

## Decisão de escopo

- Escrever primeiro dois REDs no teste existente:
  1. checkout deve manter `min-h-96`;
  2. confirmação deve exibir fallback próprio, acessível e com `min-h-96`.
- Aplicar o GREEN mínimo somente em `AppRouter.tsx`: estabilizar a geometria do fallback de checkout, criar fallback específico de confirmação e usá-lo na rota correspondente.
- Não criar abstrações adicionais, não modificar as páginas lazy e não configurar `manualChunks`.
- Executar build limpo e auditar os seis nomes de chunks e os seis marcadores exclusivos. O entry inicial não pode conter nenhum marcador; cada marcador deve aparecer no chunk da rota correspondente.
- Registrar o warning de 727,79 kB como entrada para a TASK-125, sem expandir o escopo desta task.
