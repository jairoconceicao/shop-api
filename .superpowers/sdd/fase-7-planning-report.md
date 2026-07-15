# Relatório de planejamento — Fase 7 (Pedidos)

## Status

**READY para iniciar TASK-096.** O bloqueio administrativo identificado na exploração foi removido: TASK-096 agora possui status READY, dependência concluída e critérios verificáveis. TASK-097..105 permanecem BLOCKED até suas dependências ficarem DONE.

## Artefatos produzidos

- `docs/frontend-tasks-v2.md`: metadados completos para TASK-096..105.
- `docs/superpowers/plans/2026-07-15-fase-7-pedidos.md`: plano TDD com uma unidade por TASK-ID, arquivos exatos, interfaces, testes RED/GREEN, comandos, expectativas, atualização de backlog e commit por tarefa.
- `.superpowers/sdd/fase-7-explorer-report.md`: evidência de exploração e baseline que originou as decisões.
- `.superpowers/sdd/fase-7-planning-report.md`: este registro.

## Decisões conservadoras registradas

1. Datas `YYYY-MM-DD` são dias civis locais inclusivos, convertidos para ISO no início/fim do dia; intervalo invertido é rejeitado antes da rede.
2. CPF confirmado habilita e alimenta a consulta, mas nunca entra em query key, storage ou logs; a key usa `clienteId` e filtros.
3. `404` da lista permanece erro; somente `200` com array vazio representa estado vazio.
4. A API permanece autoridade de transição; o CTA é ocultado somente em `Cancelado` e `Devolvido`, e os demais status podem receber 422.
5. Cancelamento exige dialog acessível, por ser a ação destrutiva prevista pelo plano de testes.
6. Paginação usa `size=20` fixo e expõe somente `page` na URL.
7. Contratos de pagamento, endereço e status devem ter uma fonte canônica; o plano proíbe dependência entre internals de features ou enums duplicados.

## Self-review do plano

- **Cobertura da especificação:** RF-080 → TASK-097/100; RF-081 → TASK-098; RF-082/083 → TASK-099; RF-084 → TASK-101; RF-085/RNF-012 → TASK-102; RF-086 → TASK-103; RF-087 → TASK-104; estratégia de invalidação → TASK-105; RNF-010 → TASK-100/101; RNF-013..018 aparecem nas restrições globais e passos de cada query/mutation.
- **Granularidade:** há exatamente dez tasks de plano, uma por TASK-096..105; cada uma tem teste RED, implementação mínima, GREEN, verificação e commit independente.
- **Placeholders:** busca case-insensitive por `TBD`, `TODO`, `implement later`, `fill in details`, `similar to task`, `appropriate error handling`, `add validation`, `handle edge cases` e `write tests for the above` não encontrou ocorrências.
- **Consistência de tipos:** `OrderStatus`, `OrderItem`, `Order`, `OrdersPage` e `orderQueryKeys` são definidos na TASK-096 antes do consumo; filtros/URL na 098 precedem a página 100; detalhe 101 precede hidratação/cancelamento; mutation 103 precede os efeitos 104/105.
- **Escopo:** nenhuma tarefa adiciona backend, filtro de status, tamanho configurável, frete, desconto, rastreamento, nota fiscal ou recompra.
- **Rastreabilidade:** a ordem de liberação é 096 → 097 → 098 → 099 → 100 → 101 → 102 → 103 → 104 → 105; dependências compartilhadas já DONE foram registradas no backlog.

## Verificações documentais

- Contagem de seções TASK no plano: 10/10.
- Contagem de tasks normalizadas no backlog: 10/10.
- Status: TASK-096 READY; TASK-097..105 BLOCKED.
- `git diff --check`: PASS; apenas aviso informativo de futura normalização LF/CRLF do arquivo de backlog, sem erro de whitespace.
- Nenhum código da feature foi implementado e nenhum teste de aplicação precisou ser repetido; a baseline 637/637, typecheck, lint e build PASS permanece registrada no relatório explorador no mesmo HEAD de origem.

## Próximo passo autorizado

Executar somente TASK-096 pelo workflow de explorador → implementador → revisor. TASK-097 não pode ser iniciada antes de TASK-096 ficar DONE e ter evidência registrada.
