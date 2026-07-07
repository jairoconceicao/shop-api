# Plano de Revisão de UI/UX do Frontend

## Objetivo

Revisar a experiência visual e de navegação do frontend para aproximar o produto
de uma loja virtual competitiva, com referências de mercado como Mercado Livre,
Kabum e Magazine Luiza.

O foco é a percepção de compra, descoberta de produtos e conversão. A base atual
é funcional, mas a linguagem visual e a hierarquia de informação ainda parecem
mais um painel operacional do que uma vitrine de e-commerce.

## Diagnóstico Atual

### O que já está bom

- Layout responsivo e consistente.
- Uso coerente da paleta `spanish-green`.
- Componentes base reutilizáveis já existem.
- Fluxos de carrinho e checkout estão claros.
- Estados de loading, vazio, erro e sucesso são tratados.

### O que limita a percepção de loja virtual

- Header com navegação muito funcional e pouco comercial.
- Catálogo com foco em paginação e estado de API, não em descoberta.
- Cards de produto com baixa densidade de sinais de compra.
- Página de produto sem elementos de decisão como frete, confiança e prova social.
- Áreas de pedidos e cliente com linguagem muito administrativa.

## Prioridades

### Alta

- Trocar a linguagem de "painel" por linguagem de varejo.
- Reorganizar o header para priorizar busca, categorias, ofertas e carrinho.
- Elevar a página de catálogo para motor de descoberta.
- Destacar mais preço, disponibilidade e CTA nos cards.
- Ajustar a página de produto para decisão de compra.

### Média

- Melhorar a seção de checkout com mais confiança e menos fricção.
- Reduzir a sensação de formulário administrativo no carrinho.
- Reclassificar pedidos e cliente como área de conta, não como fluxo principal.

### Baixa

- Refinar microcopy e rótulos técnicos.
- Adicionar sinais de suporte, troca, garantia e segurança.
- Melhorar densidade visual no mobile sem perder clareza.

## Diretrizes de UX

- A navegação principal deve refletir intenção de compra.
- O catálogo deve favorecer pesquisa, comparação e exploração.
- O produto deve responder rápido às perguntas:
  - quanto custa;
  - tem estoque;
  - entrega rápido;
  - posso confiar;
  - como compro.
- O checkout deve reduzir hesitação e mostrar progresso.
- O conteúdo institucional deve ser discreto.

## Recomendações Por Tela

### Header

- Adicionar busca global no topo.
- Inserir atalhos para categorias e ofertas.
- Manter carrinho sempre visível com contagem destacada.
- Rebaixar visualmente rotas como pedidos e cliente.

### Catálogo

- Criar hero com busca principal e mensagens de valor.
- Adicionar filtros mais próximos do comportamento de compra.
- Exibir mais contexto por produto:
  - preço;
  - parcelamento ou condição comercial, se houver;
  - indicação de estoque;
  - frete ou prazo quando disponível.
- Usar cards com CTA mais evidente.

### Produto

- Reforçar o bloco de preço e compra.
- Mostrar benefícios, informações de confiança e entrega.
- Adicionar produtos relacionados ou semelhantes.
- Diminuir a competição visual entre voltar e comprar.

### Carrinho

- Colocar resumo de compra mais forte.
- Destacar economia, quantidade e CTA para checkout.
- Evitar que o carrinho pareça uma tela de revisão interna.

### Checkout

- Mostrar progresso do fluxo de compra.
- Tornar o resumo fixo e sempre visível em desktop.
- Simplificar a leitura do formulário.
- Reforçar segurança e confirmação antes do envio.

### Pedidos e Cliente

- Tratar essas telas como área de conta.
- Remover linguagem de operação interna quando possível.
- Priorizar status, histórico e ações úteis ao usuário.

## Critérios de Aceitação

- O frontend precisa parecer uma loja virtual, não um sistema interno.
- O catálogo deve facilitar descoberta e navegação comercial.
- A página de produto deve orientar a compra com clareza.
- O checkout deve reduzir atrito e aumentar confiança.
- A experiência mobile deve manter CTA e leitura principal sempre acessíveis.

## Ordem Sugerida de Execução

1. Revisar header e navegação global.
2. Refinar catálogo e cards de produto.
3. Melhorar página de produto.
4. Ajustar carrinho e checkout.
5. Revisar microcopy, estados vazios e telas de conta.
6. Validar comportamento mobile e acessibilidade.

## Observação

Este plano é exclusivamente de frontend. O backend permanece fora do escopo
desta revisão e continua como fonte de verdade para regras e dados.
