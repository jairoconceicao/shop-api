# TASK-109 — evidência do `cartSessionStore`

## Decisão de escopo

“ID inválido” pertence à fronteira persistida e de migração. As actions públicas não foram alteradas. O produto já tratava falhas de `getItem`, `setItem` e `removeItem`; esta task adicionou apenas as evidências literais ausentes para leitura e remoção.

O plano previa registrar os 10 testes encontrados antes da exploração. Foi registrado o desvio para 12 testes porque a exploração comprovou lacunas literais para falhas de `getItem` e `removeItem`, e o backlog autoriza adicionar a evidência ausente para cumprir o critério de preservar o uso em memória quando o `localStorage` falhar. O produto e as actions públicas permaneceram inalterados.

Commit da implementação e da evidência inicial: `731b1bd8193643933a3d46618ed19145c0ff542e`.

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

## Quatro comandos exigidos pelo plano

| Comando completo | Resultado | Exit code |
|---|---:|---:|
| `npm --prefix frontend test -- src/features/cart/store/cartSessionStore.test.ts --reporter=verbose` | Execução 1: 1 arquivo; 12/12 PASS | 0 |
| `npm --prefix frontend test -- src/features/cart/store/cartSessionStore.test.ts --reporter=verbose` | Execução 2: 1 arquivo; 12/12 PASS | 0 |
| `npm --prefix frontend run typecheck` | PASS | 0 |
| `npm --prefix frontend run lint` | PASS | 0 |

Verificação adicional dos consumers de consulta, criação, adição, contagem, cache, checkout e exclusão de cliente: 7 arquivos e 52/52 testes PASS, exit 0.

## Transparência TDD

Os dois testes novos são **coverage GREEN**: o produto já implementava o tratamento requerido. Na primeira formulação, a prova de `getItem` exigia indevidamente preservar uma entrada anterior durante `rehydrate`; ela falhou porque o merge existente sanitiza storage indisponível para `{}`. A asserção foi corrigida para o contrato aprovado: reidratação não lança e o mapa permanece utilizável depois da falha. Nenhum código de produto foi modificado.
