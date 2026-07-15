# Design da conta do cliente — Fase 6

## Objetivo e escopo

Este documento define a implementação das TASK-086 a TASK-095 da Fase 6 de
`docs/frontend-tasks-v2.md`. O resultado deve permitir que o cliente autenticado
consulte e atualize seu perfil completo, altere sua senha e cancele sua conta.

O escopo inclui somente as rotas protegidas `/minha-conta/dados` e
`/minha-conta/senha`, os contratos e acessos à API necessários e a limpeza de
estado decorrente do cancelamento. Pedidos, alterações no backend, recuperação
de senha, múltiplos endereços, consulta por CPF e persistência local do perfil
ficam fora desta fase.

## Decisões arquiteturais

`features/customer` será a fonte canônica dos contratos, adapters, serviços,
queries, mutations e páginas da conta. O contrato parcial atualmente localizado
em `features/checkout/contracts/customerProfile.ts` será substituído pelo
contrato canônico: o checkout continuará projetando somente `customerId` e
endereço, mas fará essa projeção a partir do perfil validado pela feature de
cliente. Não haverá dois schemas para `GET /api/v1/cliente/{clienteId}`.

O perfil confirmado pertence exclusivamente ao TanStack Query. Nenhuma resposta
completa da API será copiada para Zustand ou `localStorage`. Zustand continuará
restrito à sessão de autenticação e ao vínculo versionado de carrinho já
existentes. Os valores em edição e o estado dos dialogs pertencem ao formulário
ou ao componente local.

As páginas da conta serão carregadas com `React.lazy` e `Suspense`. O fallback
terá estado semântico de carregamento e dimensões estáveis. O `AccountLayout` e a
proteção de rota continuam compartilhados; cada página é um chunk independente.

## Contratos canônicos

Todos os dados externos são validados com Zod antes de entrar no modelo da UI.
IDs de transporte aceitam inteiro `number | string`, são normalizados para
inteiro positivo e nunca incluem o token na chave de cache.

O adapter de detalhe valida um `ApiResponse<ClienteDetalheResponse>` bem-sucedido
e com `data` não nulo. O modelo canônico contém:

- `customerId`, derivado de `clienteId`;
- `cpf`, com 11 dígitos;
- `nome`, não vazio e com até 200 caracteres;
- `dataNascimento`, como data ISO `YYYY-MM-DD`, não futura;
- `email`, válido e com até 200 caracteres;
- `endereco`: `logradouro` (até 200), `numero` (até 50), `complemento` nulo ou
  até 200, `cep` (até 20), `bairro` e `cidade` (até 100), e `uf` com duas letras;
- `celular`: `ddd` com dois dígitos, `numero` não vazio com até 30 caracteres e
  `whatsApp` booleano.

O request de atualização é montado estritamente como `UpdateClienteRequest`, sem
`clienteId`, senha ou propriedades adicionais: `cpf`, `nome`, `dataNascimento`,
`email`, `endereco` e `celular`. Máscaras são removidas de CPF e DDD antes da
validação; valores textuais são aparados; UF é normalizada para maiúsculas; o
complemento vazio é enviado como `null`. A resposta de PUT, senha e DELETE é um
`ApiResponse<ClienteIdResponse>` com `clienteId` positivo e deve corresponder ao
cliente da operação; ausência de `data`, status falso ou ID divergente é falha de
contrato e não produz efeito de sucesso.

O request de senha contém exclusivamente `senhaAtual` e `senhaNova`. A nova
senha deve ter no mínimo 8 caracteres e satisfazer simultaneamente: pelo menos
uma letra maiúscula, um número e um caractere de `!@#$%`. A senha atual é
obrigatória. Nenhuma senha é aparada, persistida ou escrita em logs.

## Consulta e fluxo de dados

A chave canônica de perfil será `['private', 'customer', 'detail', customerId]`,
com `meta.private: true`. A query obtém `clienteId` e token exclusivamente da
sessão válida, é desabilitada sem ambos e chama
`GET /api/v1/cliente/{clienteId}` com Bearer token. Ela nunca consulta pelo CPF.
Trocas de sessão selecionam outra chave e respostas tardias não podem atualizar
o perfil visível de outro cliente.

Fluxo de leitura e edição:

1. A rota protegida carrega a página sob demanda.
2. A query busca e adapta o perfil do cliente da sessão.
3. A página apresenta skeleton durante a primeira leitura, retry manual em erro
   e o formulário apenas quando há perfil válido.
4. O formulário recebe um snapshot como valores iniciais. Digitação altera
   somente estado local; refetch não sobrescreve campos sujos.
5. No submit, o adapter monta e valida o request completo.
6. Se o CPF normalizado difere do CPF confirmado no snapshot, o submit é
   interrompido e um dialog específico mostra o CPF anterior e o novo em formato
   mascarado. Cancelar devolve foco ao controle que iniciou a ação; confirmar
   executa exatamente o request já validado. Qualquer outra edição não abre esse
   dialog.
7. O PUT usa `/api/v1/cliente/{clienteId}` e o token da mesma tentativa. Enquanto
   estiver pendente, o envio é bloqueado contra duplicidade.
8. Após resposta válida, o cache da chave exata recebe o perfil completo enviado,
   preservando o `customerId`, e a chave é invalidada para reconciliação com a
   API. O formulário passa a considerar esse valor o novo snapshot, inclusive
   para futuras comparações de CPF.

O checkout consumirá a mesma query/options e projetará o endereço para seu
formulário local. Alterações no checkout permanecem exclusivas do pedido e não
chamam o PUT de cliente.

## Página “Meus Dados”

O formulário expõe CPF, nome, data de nascimento, e-mail, logradouro, número,
complemento, CEP, bairro, cidade, UF, DDD, número do celular e a opção WhatsApp.
Logradouro, número e complemento permanecem campos separados. A apresentação
usa as máscaras existentes onde aplicável, mas os adapters preservam o contrato
sem máscara.

Validação local ocorre antes da rede. Erros normalizados `422` são associados aos
campos por nomes de propriedade, incluindo caminhos aninhados de `Endereco` e
`Celular`; propriedades não reconhecidas aparecem no resumo geral. `409` é
exibido como conflito sem apagar os valores. `401` segue o mecanismo global de
expiração; `403` informa falta de autorização; `404` informa perfil inexistente;
falhas `5xx` e de rede mantêm o formulário e oferecem nova tentativa. A UI não
usa o texto da mensagem da API para decidir regras.

## Troca de senha

A página contém senha atual e nova senha. Ao lado da nova senha há uma lista
persistente das quatro regras: oito caracteres, uma maiúscula, um número e um
caractere de `!@#$%`. Cada item expõe texto e estado sem depender somente de cor;
o estado é recalculado durante a digitação. O botão fica protegido contra envio
duplicado, mas os erros continuam disponíveis para leitores de tela.

O submit chama `PUT /api/v1/cliente/{clienteId}/senha`. `422` é mapeado para
`senhaAtual` ou `senhaNova` quando a propriedade é conhecida; erro geral é usado
no restante. Após sucesso válido, ambos os campos são limpos, o foco vai para a
confirmação e uma região viva anuncia a conclusão. Em falha, a senha nova pode
ser limpa por segurança; a página nunca armazena as senhas fora do formulário.

## Cancelamento da conta e limpeza

A ação de cancelamento fica em uma área de perigo visualmente distinta na página
de dados. Ela abre um dialog modal com título e consequências explícitas; não é
executada por clique único. O dialog exige que o cliente marque uma confirmação
explícita antes de habilitar a ação destrutiva. Escape ou “Voltar” fecha sem
efeito; durante a mutation o dialog não permite segundo envio.

Ao confirmar, a mutation chama `DELETE /api/v1/cliente/{clienteId}`. Somente uma
resposta adaptada, bem-sucedida e com o mesmo ID inicia a limpeza. A ordem é:

1. remover o vínculo `clienteId -> carrinhoId` do `cartSessionStore`, em memória e
   em sua persistência versionada, sem remover vínculos de outros clientes;
2. limpar a sessão do `authStore` e sua persistência;
3. remover todas as queries e mutations com `meta.private: true`, abrangendo
   perfil, carrinho, checkout, confirmações e futuros pedidos;
4. eliminar qualquer snapshot privado transitório associado ao cliente;
5. redirecionar com `replace` para uma rota pública, exibindo confirmação neutra
   sem CPF, endereço, token ou outros dados pessoais.

Se DELETE falhar, nenhuma limpeza parcial ocorre: sessão, vínculo e formulário
permanecem utilizáveis, o dialog apresenta o erro normalizado e oferece retry.
`401` continua sujeito ao encerramento global da sessão. Nenhum erro ou evento
registra token, senha, CPF, endereço ou payload completo.

## Erros, concorrência e consistência

Todas as mutations têm `retry: false`. As consultas oferecem retry manual e
respeitam cancelamento por `AbortSignal`. A mutation captura `customerId`, token
e payload no início da tentativa. Seus callbacks só atualizam cache, limpam
estado ou navegam se a sessão ainda representar o mesmo cliente; resposta tardia
de outra sessão é ignorada. Não haverá atualização otimista do perfil nem do
cancelamento, pois ambos dependem de validação e autorização do servidor.

## Acessibilidade e responsividade

As duas páginas atendem WCAG 2.2 AA entre 320 px e 1920 px, sem rolagem horizontal.
No mobile, seções e ações passam para uma coluna e CTAs primários têm pelo menos
44 px; demais alvos têm pelo menos 40 x 40 px. Labels permanecem visíveis, erros
usam `aria-describedby`, o resumo recebe foco quando houver múltiplas falhas e
mudanças assíncronas relevantes usam uma região viva sem anúncios duplicados.

Os dialogs têm nome e descrição, prendem foco, aceitam teclado, restauram foco ao
acionador e posicionam inicialmente o foco na ação segura. Foco visível usa os
tokens amber do projeto. Cor não é o único indicador de erro, regra de senha ou
perigo. Animações são curtas e desativadas com `prefers-reduced-motion`.

## Estratégia de testes

Cada comportamento novo começa com teste falhando e terá cobertura proporcional:

- schemas/adapters: `number | string`, ID zero/negativo/divergente, envelope
  nulo/falso, propriedades extras, perfil completo, request completo, máscaras,
  complemento nulo, data futura e todas as combinações das regras de senha;
- services: método, URL, Bearer token, body estrito, `AbortSignal` em GET e
  adaptação de GET/PUT/PUT senha/DELETE;
- query: chave privada por cliente, desabilitação sem sessão, troca de cliente,
  resposta tardia e erro de contrato;
- mutations: sem retry, bloqueio de duplicidade, mapeamento de `409/422`, update e
  invalidação da chave exata, limpeza de senha, falha sem efeitos e cancelamento
  com limpeza integral na ordem definida;
- páginas com Testing Library e MSW: loading, sucesso, retry, campos completos,
  erros locais/remotos, confirmação apenas para CPF alterado, lista visual de
  senha, foco/teclado dos dialogs, área de perigo e layouts representativos;
- integração de rotas: proteção e chunks lazy separados para dados e senha;
- regressão do checkout: única requisição canônica e projeção do endereço sem PUT.

Além dos testes focados, cada task exige typecheck, lint e a suíte ampla do
frontend antes de ser marcada como concluída. O build deve demonstrar chunks de
conta fora do entry bundle.

## Decomposição e dependências das tasks

- **TASK-086** — contratos canônicos de detalhe, atualização e resposta por ID;
  migração do adapter parcial do checkout. Não depende de outra task da fase.
- **TASK-087** — service e query privada pelo cliente da sessão. Depende da
  TASK-086.
- **TASK-088** — página e formulário completos de “Meus Dados”, estados de
  consulta e carregamento lazy. Depende da TASK-087.
- **TASK-089** — dialog e interceptação do submit quando o CPF mudar. Depende da
  TASK-088.
- **TASK-090** — service/mutation de PUT completo e mapeamento de erros. Depende
  das TASK-086 e TASK-089.
- **TASK-091** — atualização, invalidação e reconciliação do cache após PUT.
  Depende da TASK-090.
- **TASK-092** — schema de senha e indicador acessível das regras. Depende apenas
  da TASK-086 para reutilizar o adapter de resposta por ID.
- **TASK-093** — página lazy, service e mutation de troca de senha. Depende da
  TASK-092.
- **TASK-094** — área de perigo e dialog acessível. Depende da TASK-088.
- **TASK-095** — service/mutation DELETE, guardas contra resposta tardia, limpeza
  integral e redirecionamento. Depende das TASK-087 e TASK-094.

TASK-092 e TASK-093 podem ser implementadas depois da TASK-086 sem esperar o
fluxo de atualização, mas o workflow do repositório continua permitindo apenas
um agente com escrita por checkout. Nenhuma task da Fase 7 é necessária para
concluir este desenho.

## Critérios de conclusão da fase

A fase está concluída quando os requisitos RF-090 a RF-097 e RNF-001 a RNF-007,
RNF-010, RNF-013, RNF-014, RNF-016 e RNF-018 aplicáveis passam; os quatro
endpoints de perfil usados correspondem à API existente; o checkout reutiliza o
contrato canônico; dados remotos não são duplicados em Zustand; cancelamento
remove todos os dados privados definidos; páginas funcionam por teclado, mobile
e desktop; testes, typecheck, lint e build passam sem findings CRITICAL ou
IMPORTANT pendentes.
