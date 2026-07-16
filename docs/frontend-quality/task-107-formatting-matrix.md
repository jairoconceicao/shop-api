# TASK-107 — matriz de formatadores e normalizadores

## Moeda

| Entrada | Saída literal |
| --- | --- |
| `0` | `R$\u00a00,00` |
| `-12.5` | `-R$\u00a012,50` |
| `1234.56` | `R$\u00a01.234,56` |

O espaço entre `R$` e o valor é NBSP (`U+00A0`). Os nove consumidores usam o helper compartilhado `formatCurrency`, totalizando treze chamadas.

## Dados pessoais

| Tipo | Entradas | Normalizado | Round-trip |
| --- | --- | --- | --- |
| CPF | `abc123.456.789-01xyz`, `1234567890199` | `12345678901` | `normalizeCpf(formatCpf(input))` preserva o normalizado |
| CEP | `CEP 12345-678 xx99`, `123456789` | `12345678` | `normalizePostalCode(formatPostalCode(input))` preserva o normalizado |
| Telefone | `tel:+55 (11) 91234-5678` | `55119123456` | `normalizeCellPhone(formatCellPhone(input))` preserva a truncagem atual |
| Telefone | `1191234567899` | `11912345678` | `normalizeCellPhone(formatCellPhone(input))` preserva a truncagem atual |

O prefixo `+55` não recebe semântica nova: a regra permanece sendo remoção de caracteres não numéricos e limite aos primeiros onze dígitos.

## Data civil local

Datas em `00:00` e `23:59` preservam o dia civil local, inclusive sob `America/Sao_Paulo` e `UTC`. Uma `Invalid Date` lança `RangeError` e nunca produz texto contendo `NaN`.

## Cobertura focada

- `src/shared/formatting/personalData.test.ts`
- `src/shared/formatting/currency.test.ts`
- `src/shared/dates/localCivilDate.test.ts`
- `src/features/orders/routing/ordersUrl.test.ts`
- `src/features/customer/contracts/customerProfile.test.ts`
- `src/features/orders/formatting/orderPresentation.test.ts`
- testes dos nove consumidores listados no plano da TASK-107
