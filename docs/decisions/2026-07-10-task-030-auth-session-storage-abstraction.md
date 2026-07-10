# Decisão: Abstração de sessão para futura migração a cookie HttpOnly

Data: 2026-07-10
Status: Aceita

## Contexto

A v1 atual do frontend autentica com bearer token e persiste a sessão em `localStorage` para suportar `AuthService`, `AuthGuard` e `HttpInterceptor`.

A migração futura para cookie `HttpOnly` não deve exigir uma refatoração ampla da camada de autenticação. O ponto de troca precisa ficar isolado.

## Decisão

A persistência de sessão foi extraída para uma abstração dedicada, com a implementação atual baseada em `localStorage` registrada como provider padrão.

Em v1:
- `TokenStorageService` atua como fachada de alto nível para o restante da aplicação;
- a persistência concreta fica encapsulada em `AuthSessionStorage`;
- a implementação atual continua compatível com a sessão serializada e com a chave legada do token.

## Consequências

- A migração futura para cookie `HttpOnly` pode trocar apenas a implementação provida para `AuthSessionStorage`.
- O restante da autenticação continua consumindo a mesma API de alto nível.
- O comportamento atual permanece inalterado para login, logout, guard e interceptor.
