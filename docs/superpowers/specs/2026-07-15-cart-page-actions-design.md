# Ações da página do carrinho

## Contexto

A página do carrinho já apresenta os itens e os totais, mas o resumo não oferece caminhos diretos para retomar a compra ou iniciar o checkout. A mudança adiciona essas ações ao `CartSummary` somente quando há itens confirmados no carrinho.

## Componentes

O `CartSummary` exibirá dois `LinkButton` usando os componentes e variantes existentes do design system:

- “Continuar comprando”: variante secundária e destino `/`, a rota atual do catálogo de produtos.
- “Ir para checkout”: variante primária e destino `/checkout`.

As ações ficarão no resumo, junto aos totais. “Continuar comprando” aparecerá antes de “Ir para checkout”, preservando o checkout como ação visual principal.

## Fluxo e estados

Com um ou mais itens confirmados, o cliente pode voltar ao catálogo por “Continuar comprando” ou seguir para o checkout por “Ir para checkout”. A navegação será interna à SPA, conforme o comportamento de `LinkButton`.

Sem itens, o `CartSummary` não renderizará essas ações. Os estados existentes de carrinho vazio, carregamento e erro permanecem responsáveis por suas próprias mensagens e ações. A disponibilidade dos links deriva apenas dos itens já usados para renderizar o resumo; a mudança não cria estado local ou remoto adicional.

## Acessibilidade

Os textos visíveis serão os nomes acessíveis dos links. Ambos serão alcançáveis e ativáveis por teclado e manterão o estilo global de foco visível. A ordem no DOM será “Continuar comprando” e depois “Ir para checkout”, igual à ordem visual.

## Responsividade

As ações devem permanecer legíveis e acionáveis entre 320 px e desktop amplo, sem overflow horizontal. Em larguras reduzidas, serão organizadas em coluna e ocuparão a largura disponível; em larguras maiores, poderão usar a composição já adotada pelo `CartSummary`, mantendo a ação primária visualmente dominante.

## Testes

Os testes do carrinho verificarão:

- renderização dos dois links quando houver itens;
- textos acessíveis e destinos exatos `/` e `/checkout`;
- ausência dos dois links quando não houver itens.

Os testes existentes de estado vazio, totais e navegação do carrinho devem continuar passando.

## Fora de escopo

Não fazem parte desta mudança alterações em regras de negócio, cálculo de totais, caches, queries, mutations, persistência, endpoints, guard de checkout, página de checkout ou backend. Também não serão adicionadas confirmações, analytics ou inclusão automática de produtos.
