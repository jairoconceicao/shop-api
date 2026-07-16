# TASK-109 — evidência do `cartSessionStore`

## Decisão de escopo

“ID inválido” pertence à fronteira persistida e de migração. As actions públicas não foram alteradas. O produto já tratava falhas de `getItem`, `setItem` e `removeItem`; esta task adicionou apenas as evidências literais ausentes para leitura e remoção.

## Matriz de critérios

| Critério | Evidência automatizada |
|---|---|
| Persistir somente o mapa e a versão | `persists only the customer-to-cart map with a version` |
| Isolar carrinhos por cliente | `keeps cart ids independent for each customer` |
| Atualizar somente a chave alvo | `updates only the selected customer cart id` |
| Remover somente a chave alvo | `removes only the selected customer cart id` |
| Restaurar estado persistido | `restores persisted cart ids on rehydration` |
| Migrar v0 e descartar IDs/chaves inválidos | `migrates version zero while keeping only valid customer-to-cart entries` |
| Descartar shape inválido | `discards an invalid persisted shape during migration` |
| Sanitizar versão atual e campos remotos | `sanitizes a corrupted current-version payload without restoring remote fields` |
| Canonicalizar chave numérica legada | `canonicalizes numeric customer keys restored from legacy storage` |
| Continuar em memória quando `setItem` falha | `keeps the in-memory map usable when localStorage is unavailable` |
| Não lançar e continuar utilizável quando `getItem` falha | `keeps the in-memory map usable when localStorage fails during rehydration` |
| Não lançar e continuar utilizável quando `removeItem` falha | `keeps the in-memory map usable when localStorage fails during removal` |

## Execuções

| Verificação | Resultado | Exit code |
|---|---:|---:|
| Teste focado, execução 1 | 1 arquivo; 12/12 PASS | 0 |
| Teste focado, execução 2 | 1 arquivo; 12/12 PASS | 0 |
| Consumers de sessão do carrinho | 7 arquivos; 52/52 PASS | 0 |
| `npm --prefix frontend run typecheck` | PASS | 0 |
| `npm --prefix frontend run lint` | PASS | 0 |

Comandos focados: `npm --prefix frontend test -- src/features/cart/store/cartSessionStore.test.ts --reporter=verbose`, executado duas vezes. Consumers verificados: consulta, criação, adição, contagem, cache, checkout e exclusão de cliente.

## Transparência TDD

Os dois testes novos são **coverage GREEN**: o produto já implementava o tratamento requerido. Na primeira formulação, a prova de `getItem` exigia indevidamente preservar uma entrada anterior durante `rehydrate`; ela falhou porque o merge existente sanitiza storage indisponível para `{}`. A asserção foi corrigida para o contrato aprovado: reidratação não lança e o mapa permanece utilizável depois da falha. Nenhum código de produto foi modificado.
