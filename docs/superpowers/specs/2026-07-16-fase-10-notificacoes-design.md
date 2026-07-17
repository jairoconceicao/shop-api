# Fase 10 — Notificações — Design

**Data:** 2026-07-16
**Status:** PLANNED
**Dependências:** Fase 7 (Pedidos), Fase 9 (Estoque) — apenas para integração de disparo

## 1. Contexto

Último domínio do `domain-modeling.md` ainda não implementado. Notificações devem informar o cliente sobre eventos relevantes do ciclo de vida do pedido.

## 2. Objetivo

Implementar domínio de notificações com canais simulados (log + email mock), endpoint de consulta e frontend com central de notificações.

## 3. Design do Domínio

### Notificacao

```csharp
public class Notificacao
{
    public long Id { get; private set; }
    public long ClienteId { get; private set; }
    public TipoNotificacao Tipo { get; private set; }
    public CanalNotificacao Canal { get; private set; }
    public StatusNotificacao Status { get; private set; }
    public string Titulo { get; private set; }
    public string Mensagem { get; private set; }
    public DateTime CriadaEm { get; private set; }
    public DateTime? LidaEm { get; private set; }
    public DateTime ExpiracaoEm { get; private set; }

    public static Result<Notificacao> Criar(long clienteId, TipoNotificacao tipo, CanalNotificacao canal, string titulo, string mensagem);
    public Result MarcarComoLida();
}
```

**Regras:**
- `titulo` obrigatório (max 200 chars)
- `mensagem` obrigatória (max 2000 chars)
- `ExpiracaoEm` = `CriadaEm + 90 dias`
- Só pode marcar como lida se `Status == NaoLida`
- Idempotente: marcar já lida não gera erro

### Enums

```csharp
public enum TipoNotificacao { PedidoCriado, PedidoCancelado, PedidoProcessado }
public enum CanalNotificacao { Sistema, Email }
public enum StatusNotificacao { NaoLida, Lida }
```

## 4. Use Cases

### DispararNotificacaoCommand

```
Input:  clienteId, tipoNotificacao, dados (objeto com detalhes do evento)
Output: Result<NotificacaoResponse> (internal, usado por outros commands)
```

- Cria notificação no canal `Sistema` (sempre)
- Se canal `Email` disponível, cria segunda notificação
- Usa `INotificacaoRepository` para persistir
- Dispara `IEmailSender.EnviarAsync()` para canal email (mock)

### ConsultarNotificacoesQuery

```
Input:  clienteId, status (opcional), page, size
Output: Result<PagedResult<NotificacaoItemResponse>>

NotificacaoItemResponse { id, tipo, titulo, mensagem, status, criadaEm, lidaEm }
```

### MarcarNotificacaoLidaCommand

```
Input:  notificacaoId (individual) OU ids[] (lote)
Output: Result
```

## 5. Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/v1/notificacao` | Required | Listar notificações do cliente |
| PATCH | `/api/v1/notificacao/{id}/lida` | Required | Marcar uma como lida |
| PATCH | `/api/v1/notificacao/lida` | Required | Marcar várias como lida (body: `{ ids: [1,2,3] }`) |

### Integração com Pedido

No `PedidoCriarCommand`, após persistir pedido com sucesso:
```csharp
await dispararNotificacao.ExecuteAsync(new DispararNotificacaoInput(
    pedido.ClienteId,
    TipoNotificacao.PedidoCriado,
    new { pedidoId = pedido.Id, valorTotal = pedido.ValorTotal }
));
```

Mesmo padrão no `PedidoCancelarCommand` com `TipoNotificacao.PedidoCancelado`.

### Canal de Email (`IEmailSender`)

```csharp
public interface IEmailSender
{
    Task EnviarAsync(string destinatario, string assunto, string corpo, CancellationToken ct);
}
```

Implementação `LogEmailSender`:
- Registra no logger: `[EMAIL MOCK] Para: {destinatario}, Assunto: {assunto}`
- Não envia email real
- Permite troca futura por SendGrid/outro provider

## 6. Frontend

### Header — Badge de notificações

- Ícone sino (`BellIcon`) no header ao lado do carrinho
- Badge numérico com contador de não lidas (bolinha vermelha com número)
- Query: `useUnreadNotificationCount()` — polling a cada 60s ou invalidação ao marcar lida
- Clique redireciona para `/notificacoes`

### Página `/notificacoes`

- Lista paginada com cards de notificação
- Filtro: "Todas", "Não lidas", "Lidas" (chips horizontais)
- Cada card mostra: ícone por tipo, título, mensagem (truncada em 2 linhas), data relativa ("há 2h")
- Não lidas têm fundo levemente azul (`bg-shop-primary-soft`)
- Botão "Marcar como lida" individual no card
- Botão "Marcar todas como lida" no topo

### Hooks

- `useNotificationsQuery({ status, page })` — React Query
- `useUnreadCountQuery()` — contagem de não lidas
- `useMarkAsReadMutation()` — otimista: remove do contador imediatamente
- `useMarkAllAsReadMutation()` — otimista: zera contador
- Cache key factory: `notificationKeys.*`

## 7. Testes

| Camada | O que testar |
|--------|-------------|
| Domínio | `Notificacao.Criar()` com parâmetros válidos; `MarcarComoLida()` idempotente; expiração = +90 dias |
| Aplicação | Disparo gera notificação sistema; Disparo gera notificação email quando canal disponível; Query filtra por status; Marcar lida em lote com ids vazios retorna erro |
| API | GET paginado retorna notificações do cliente autenticado; PATCH individual retorna 404 para id inexistente; PATCH lote retorna 200 |
| Integração | Criar pedido → notificação gerada; Cancelar pedido → notificação gerada |
| Frontend MSW | Badge renderiza contador; Página lista notificações; Marcar lida atualiza UI otimista |
| Frontend E2E | Fluxo completo: login → criar pedido → ver notificação → marcar lida |
