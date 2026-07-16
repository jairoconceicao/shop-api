# TASK-108 — exploração de `authStore`

## Contexto e baseline

- Worktree: `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
- `BASE_COMMIT`: `b7d56c5d87ed5ad362f8b5130c483969660de18a`
- Backlog: `TASK-108` está `READY`; dependências `TASK-032`, `TASK-033`, `TASK-037`, `TASK-039` e `TASK-040` estão declaradas.
- Baseline executada: `npm --prefix frontend test -- src/features/auth/store/authStore.test.ts` — **PASS**, 1 arquivo, 7/7 testes.
- O checkout estava limpo antes deste relatório.

## Interfaces e fronteiras encontradas

- `authStore.ts` exporta `AUTH_STORE_KEY = 'shop-api:auth'`, `AUTH_STORE_VERSION = 1`, `AuthSession`, `AuthPersistence`, `isAuthSessionExpired` e `useAuthStore`.
- `AuthSession` contém somente `token`, `tipo`, `expiraEm`, `usuarioId`, `clienteId` e `email`; `AuthPersistence` é `'session' | 'local'`.
- `login.ts` já valida respostas remotas com Zod estrito, exige token/tipo não vazios, ISO datetime com offset, IDs seguros e email, e adapta IDs antes de produzir `AuthSession`. Essa proteção não existe na fronteira de reidratação, onde o valor é `unknown`.
- `AuthSessionInitializer` observa a sessão, limpa imediatamente se expirada e agenda `setTimeout(clearSession, Date.parse(expiraEm) - Date.now())`.
- Logout e `401` chamam `clearSession()` e também limpam cache privado. Esses fluxos são fronteira das TASK-111/123/126; para TASK-108 importa comprovar que `clearSession` remove memória e os dois wrappers.
- Zustand 5.0.14 entrega a `migrate` apenas `deserializedStorageValue.state`; se a versão difere e não há `migrate`, registra erro, não faz merge, e deixa o wrapper antigo intacto. `merge` também é aplicado a payload da versão atual, portanto precisa sanitizar ambos.

## Cobertura já existente (não duplicar)

Os sete testes atuais comprovam:

1. sessão não permanente gravada com versão em `sessionStorage`;
2. troca de `session` para `local` e remoção do wrapper anterior;
3. `clearSession` limpa memória e os dois storages;
4. expiração atingida, data inválida e token vazio em `isAuthSessionExpired`;
5. reidratação válida antes do vencimento;
6. reidratação expirada e remoção do wrapper local;
7. timer limpando a sessão exatamente no vencimento.

Também já existem `try/catch` em leitura, escrita e remoção do storage. Falha de leitura retorna `null`; falha de escrita preserva o estado em memória.

## Lacunas reais e REDs concretos

### 1. Payload persistido não é validado estruturalmente

Na versão atual, o merge raso aceita qualquer `state` da versão 1. Expiração ausente ou inválida acaba sendo limpa pelo callback, mas isso é incidental e não valida os demais campos. Um payload com sessão aparentemente válida e campo extra, email inválido, IDs não seguros, `tipo` vazio ou `persistence` fora da união é reidratado.

RED recomendado: persistir um payload `version: 1` com `session: { ...session, extra: 'remote' }`, reidratar e esperar sessão nula e ambos os wrappers removidos. Acrescentar tabela representativa para `expiraEm: ''`, `expiraEm: 'invalid'`, email inválido/ID inseguro e estado com propriedade extra. Evitar testar novamente todas as regras já pertencentes a `login.test.ts`; aqui o objetivo é a fronteira persistida não confiável.

### 2. Versão 0 não é migrada nem descartada com limpeza

Sem `migrate`, Zustand ignora o estado v0 e mantém o usuário deslogado, porém conserva o wrapper antigo e emite `console.error`. Isso não satisfaz “migrar ou descartar com segurança”.

RED recomendado: gravar `{ state: { session: { ...session, extra: 'remote' }, persistence: 'local' }, version: 0 }`, reidratar e esperar sessão nula, ausência da chave nos dois storages e nenhuma exceção. A estratégia mínima do plano (sanitizar via `migrateAuthState`) descarta; não há contrato histórico confiável que justifique migrar dados v0.

### 3. JSON corrompido fica armazenado

`createJSONStorage` lança no `JSON.parse`; o pipeline de hydrate captura a falha e mantém a aplicação utilizável, mas `onRehydrateStorage` recebe o erro em vez do estado e o wrapper corrompido permanece. Cada nova hidratação repete a falha.

RED recomendado: gravar `'{'` em local e/ou session storage, aguardar `rehydrate()`, esperar resolução sem rejeição, sessão nula e remoção dos dois wrappers. O snippet atual do plano não cobre este caso: seu callback `(state) => ...` ignora o segundo parâmetro `error`, logo não removerá JSON sintaticamente corrompido. A implementação precisa limpar também no caminho de erro de reidratação.

### 4. Falhas de storage precisam ser provadas, inclusive remoção

- Leitura indisponível: `readStorage` já retorna `null`; RED/contrato deve garantir que `rehydrate()` não rejeita e começa deslogado.
- Escrita indisponível: `setSession` limpa primeiro e depois atualiza memória; o `setItem` captura a falha. O teste planejado é apropriado e provavelmente GREEN desde o início (teste de caracterização, não RED).
- Remoção indisponível: os dois `removeItem` são independentes e capturados; vale comprovar que `clearSession()` ainda limpa memória sem lançar.
- Nuance: no `setItem`, se a escrita no storage alvo lançar, a remoção do storage stale não é executada porque ambas estão no mesmo `try`. A sessão em memória continua utilizável, mas um wrapper stale pode sobreviver. Se o critério interpretar “limpeza do storage anterior” também sob falha parcial, criar RED com spy que falha somente na gravação alvo e verificar tentativa/limpeza do stale em `finally` ou operações isoladas.

### 5. Timer tem limite de plataforma não contemplado no plano

O teste atual cobre o instante exato e deve continuar. Porém `window.setTimeout` não representa com segurança atrasos acima de `2_147_483_647 ms` (~24,8 dias); navegadores normalmente reduzem overflow a atraso mínimo, podendo deslogar cedo uma sessão de longa duração.

RED recomendado se tokens puderem durar mais de 24 dias: sessão vencendo em 30 dias não deve ser limpa no primeiro tick; agendar em fatias de `2_147_483_647 ms` e reavaliar. O plano não menciona essa lacuna. Se a API garantir TTL menor, registre explicitamente a garantia e mantenha fora do escopo.

### 6. Conflito entre wrappers

`getItem` prioriza `localStorage` (`local ?? session`). Um wrapper local inválido/stale mascara uma sessão válida em `sessionStorage`; depois a limpeza remove ambos. A escolha normal e a troca de storage já passam, mas reidratação após escrita parcial pode perder uma sessão válida. O critério não define precedência em conflito; a opção segura é descartar ambos, e um teste deve documentá-la se o caso for incluído.

## Confronto com os snippets do plano

- O schema Zod estrito e o uso comum por `migrate` + `merge` são necessários e compatíveis com Zustand 5.0.14.
- `z.iso.datetime({ offset: true })` aceita `Z` e offsets como `-03:00`; o teste proposto de offset é bom para `isAuthSessionExpired`, embora a função atual provavelmente já passe.
- O caso `expiraEm` ausente não aparece na tabela do plano e deve ser adicionado explicitamente para satisfazer o backlog.
- O caso de dados extras está apenas em `version: 0`; isso não prova que `merge` sanitiza a versão atual. Adicionar extra também em `version: AUTH_STORE_VERSION`.
- O callback proposto de `onRehydrateStorage` limpa payload descartado após merge/migrate, mas não JSON corrompido, porque no erro recebe `(undefined, error)`. Ajustar o callback para limpar quando `error` existir.
- A expectativa do plano de que “payload versão 0/campo extra” seja o RED principal está correta, mas são dois mecanismos distintos e precisam de casos separados.
- O cleanup proposto com `vi.useRealTimers`, `vi.restoreAllMocks`, limpeza dos storages e reset do estado é superior ao cleanup atual: hoje `afterEach(() => clearSession())` pode executar enquanto fake timers/spies ainda estão ativos e cada teste restaura timers manualmente.
- `setSession` continua aceitando `AuthSession` tipada sem validação runtime. Isso é aceitável se a sanitização ficar na entrada persistida e o login continuar passando pelo contrato Zod; não duplique parsing no store sem RED.

## Sequência sugerida ao implementador

1. Fortalecer cleanup do teste.
2. Adicionar primeiro REDs separados para versão atual com extra, v0, expiração ausente/inválida e JSON corrompido; executar a suíte focada e registrar quais falham.
3. Adicionar caracterizações de falha de leitura, escrita e remoção e de offset `-03:00`.
4. Implementar schema estrito + função de sanitização usada em `migrate` e `merge`.
5. Limpar ambos os wrappers também no callback de erro de reidratação.
6. Preservar `try/catch` e separar operações de escrita/limpeza se o teste de falha parcial for adotado.
7. Só alterar `AuthSessionInitializer` se houver RED do limite de timer ou outro RED real; o caso exato atual já passa.
8. Rodar teste focado, typecheck e lint.

## Limites de escopo

- Não alterar login/logout/unauthorized nem caches nesta task; eles apenas consomem `clearSession` e serão cobertos nas tasks de integração/hardening.
- Não transformar TASK-108 em teste integrado com MSW.
- Não migrar arbitrariamente v0 para sessão autenticada sem um contrato histórico verificável; descarte seguro é preferível.
