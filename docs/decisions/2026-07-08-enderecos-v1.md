# Decisão: Endereços salvos fora da v1

Data: 2026-07-08
Status: Aceita

## Contexto

O backend atual expõe um único endereço embutido no recurso de cliente e recebe `enderecoEntrega` explicitamente na criação do pedido. Não existem rotas dedicadas para listar, criar, editar ou selecionar múltiplos endereços salvos.

## Decisão

A primeira versão pública não suportará múltiplos endereços salvos.

Em v1:
- o cliente mantém um único endereço no próprio perfil;
- o checkout envia `enderecoEntrega` explicitamente em `POST /api/v1/pedido`;
- o frontend não deve depender de catálogo, seleção ou gerenciamento de endereços salvos.

## Consequências

- O escopo de checkout e área do cliente permanece menor e consistente com o backend atual.
- A gestão dedicada de endereços salvos continua planejada como evolução futura de domínio, API e frontend.
- O contrato OpenAPI e o plano de frontend passam a registrar explicitamente essa limitação de v1.
