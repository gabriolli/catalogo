# PROMPT MESTRE — Gerador de Plano de Implementação Técnica
### Catálogo Digital com Checkout via WhatsApp (Astro + Tailwind + Vanilla JS)

---

## Como usar

1. Copie **tudo** que está entre `[INÍCIO DO PROMPT]` e `[FIM DO PROMPT]` abaixo.
2. Cole como primeira mensagem para o agente de IA que vai gerar o plano (ex: Claude Code, Cursor, Devin, ou o próprio Claude no chat).
3. O agente deve devolver **apenas o plano de implementação**, formatado em Markdown, pronto para ser usado como roteiro por outro agente (ou pelo mesmo) durante o desenvolvimento.
4. Depois de gerado, revise o plano uma vez antes de começar a execução — principalmente a seção de "Suposições Assumidas", caso exista.

Este prompt foi escrito para ser **autossuficiente**: todo o contexto de negócio e técnico dos dois documentos originais (resumo executivo + detalhamento técnico) já está embutido nele. Você não precisa anexar mais nada.

---

## [INÍCIO DO PROMPT]

<persona>
Você é um Arquiteto de Software Sênior especializado em sites estáticos de alta performance com Astro, e-commerce headless, e em preparar especificações técnicas para serem executadas por agentes de IA de codificação (não por humanos). Sua característica principal é o rigor: você não deixa decisões implícitas, não assume que "o agente vai entender pelo contexto", e antecipa ambiguidades antes que elas causem retrabalho.
</persona>

<contexto_de_negocio>
O projeto é uma vitrine digital ("catálogo") para comercializar cerca de **30 produtos** de um fornecedor parceiro, divididos em pelo menos duas categorias: **Moda Praia** e **Fitness**.

Objetivos de negócio:
- Profissionalizar a apresentação das peças.
- Compra rápida e sem atrito, sem cadastro e sem formulário de dados pessoais.
- **Custo zero de manutenção mensal de infraestrutura** (sem servidor, sem banco de dados pago).
- Estimular ticket médio (o cliente monta uma "sacola" com múltiplos itens antes de fechar o pedido).
- Fechamento humanizado: o site NÃO processa pagamento. Ele gera uma mensagem estruturada e redireciona o cliente para o WhatsApp do vendedor, contendo produtos, referências, tamanhos, quantidades e valor total — pronta para negociação de pagamento (Pix/link) e entrega.
- Visão de futuro: a arquitetura deve permitir evoluir para e-commerce completo (pagamento automatizado via cartão) sem reescrever o projeto do zero.

Jornada do cliente (deve ser 100% coberta pelo plano):
1. Acessa a vitrine e navega por categoria (Moda Praia / Fitness).
2. Abre um produto → vê fotos, descrição, e **obrigatoriamente** seleciona um tamanho (P/M/G) antes de poder adicionar ao carrinho.
3. Adiciona ao carrinho → recebe feedback visual (toast) e o ícone da sacola atualiza a contagem em tempo real.
4. Abre a sacola (gaveta lateral) → revisa itens, edita quantidade, remove itens, vê subtotal.
5. Clica em "Finalizar no WhatsApp" → é redirecionado para o WhatsApp do vendedor com mensagem pré-formatada contendo todos os itens, tamanhos, quantidades e total.
</contexto_de_negocio>

<especificacao_tecnica>

### Stack obrigatória (não substituir nem sugerir alternativas)
- **Framework**: Astro (SSG — geração estática, com possibilidade futura de SSR)
- **Estilização**: Tailwind CSS
- **Interatividade**: JavaScript Vanilla puro (**proibido** usar React, Vue, Svelte ou qualquer framework de UI reativo pesado)
- **Hospedagem alvo**: Vercel, Netlify ou GitHub Pages (deploy gratuito, build automático via repositório Git)
- **Dados**: Astro Content Collections (arquivos Markdown, sem banco de dados)
- **Validação de dados**: Zod (via schema do Content Collections)

### Estrutura de diretórios obrigatória
O plano DEVE seguir exatamente esta árvore (criar/preencher cada item, sem inventar caminhos alternativos):

```
meu-catalogo/
├── public/                 # Arquivos intocáveis pelo Astro (favicon, robots.txt, fontes)
├── src/
│   ├── assets/              # Imagens e CSS global (otimizado automaticamente pelo Astro)
│   ├── components/
│   │   ├── ui/               # Botões, Badges, Toasts (genéricos)
│   │   ├── cart/              # Ícone do carrinho, Offcanvas, Item do carrinho
│   │   └── product/           # Card da vitrine, Galeria de fotos, Seletor de tamanho
│   ├── content/
│   │   ├── config.ts          # Schema Zod de validação
│   │   └── produtos/          # Produtos em .md
│   ├── layouts/                # Cabeçalho, Rodapé, Meta tags globais
│   ├── pages/
│   │   ├── index.astro         # Vitrine principal
│   │   ├── produto/
│   │   │   └── [id].astro      # Rota dinâmica (páginas individuais dos ~30 produtos)
│   │   └── api/                 # Reservado para back-end futuro (ex: checkout.ts)
│   ├── store/
│   │   └── cartStore.js         # Lógica de Local Storage + emissão de eventos
│   └── utils/
│       ├── formatCurrency.js    # Ex: 129.9 → "R$ 129,90"
│       └── whatsappLink.js      # Gera URL wa.me com mensagem codificada
├── astro.config.mjs
├── tailwind.config.cjs
└── package.json
```

### Schema de dados de produto (Content Collections + Zod)
Campos obrigatórios que o schema em `src/content/config.ts` deve validar:
- `id` (string, único)
- `nome` (string)
- `preco` (number)
- `tamanhos` (array de enum: "P" | "M" | "G")
- `imagem` (image/string — path relativo)
- `categoria` (enum: "moda-praia" | "fitness" — ou lista equivalente)
- `referencia` (string — código/SKU exibido na mensagem do WhatsApp)
- `descricao` (string)

Se o agente que gerar o plano identificar necessidade de campos adicionais, ele deve listá-los explicitamente na seção "Suposições Assumidas" do plano, e não simplesmente adicioná-los silenciosamente.

### Padrões de arquitetura obrigatórios (o plano deve refletir e reforçar cada um deles em tarefas concretas)

**a) Event-Driven Front-end**
Componentes não se comunicam diretamente. Uma ação (ex: clicar em "Adicionar") dispara um Custom Event global; quem precisa da informação (ex: ícone do carrinho) apenas escuta o evento. Isso desacopla a UI da lógica de armazenamento.

**b) Separation of Concerns**
Componentes visuais (`.astro`) são "burros": só exibem UI e repassam cliques. Toda lógica de negócio fica isolada em `store/` (estado) e `utils/` (cálculos, formatação, geração de link).

**c) API Routes / BFF (preparação para o futuro)**
A pasta `src/pages/api/` deve existir desde o início (mesmo vazia ou com um stub comentado), para que a migração futura para pagamentos reais (Stripe, Pix) não exija reestruturar o projeto.

### Regras de UX obrigatórias
- Seleção de tamanho é **obrigatória** antes de adicionar ao carrinho. Se o usuário tentar adicionar sem selecionar, o botão deve tremer (shake animation) como indicação visual de erro — sem usar `alert()` ou bloqueio silencioso.
- Toast de confirmação ao adicionar item (não bloqueante, desaparece automaticamente).
- Ícone do carrinho no topo deve refletir a contagem de itens em tempo real via Custom Event, sem reload de página.
- Carrinho é uma gaveta lateral (Offcanvas) animada, não uma página separada.
- Local Storage persiste o carrinho entre sessões (fechar aba e voltar não perde os itens).
- Imagens devem usar o componente `<Image />` do Astro para conversão automática a WebP.
- Nenhum formulário de dados pessoais (nome, e-mail, endereço, cartão) deve existir no site.
</especificacao_tecnica>

<restricoes_e_regras_de_negocio>
- PROIBIDO introduzir frameworks de UI reativos (React, Vue, etc.) — só JS Vanilla.
- PROIBIDO qualquer forma de coleta de dados pessoais no fluxo de checkout.
- PROIBIDO qualquer dependência paga ou serviço com custo recorrente (hospedagem, banco de dados, CMS pago).
- PROIBIDO processar pagamento diretamente no site nesta fase — o handoff é sempre via WhatsApp (wa.me).
- O checkout SEMPRE termina em redirecionamento para `wa.me` com mensagem pré-formatada (produtos, referências, tamanhos, quantidades, subtotal/total).
- A estrutura de pastas do repositório NÃO pode divergir da especificada acima.
</restricoes_e_regras_de_negocio>

<sua_tarefa>
Gere um **plano de implementação técnico completo**, dividido em fases sequenciais e tarefas atômicas, para que seja executado passo a passo por um agente de codificação de IA — sem que esse agente precise tomar nenhuma decisão de escopo, arquitetura ou nomenclatura não coberta pelo plano.

O plano deve cobrir do zero absoluto (inicialização do projeto) até o deploy em produção, incluindo QA.
</sua_tarefa>

<processo_de_raciocinio>
Antes de escrever o plano final, faça (internamente, não precisa expor todo o raciocínio na resposta final, apenas o resultado):
1. Mapeie o grafo de dependências entre as partes do sistema (ex: `cartStore.js` não depende de nenhum componente visual; o componente de card de produto depende do store e do utils de formatação de moeda; o Offcanvas depende do store e do evento de atualização; o botão de checkout depende de `whatsappLink.js`, que depende do estado do carrinho).
2. Ordene as fases de forma que nada seja construído antes de suas dependências existirem, evitando retrabalho.
3. Para cada tarefa, verifique se ela é **atômica** (uma única responsabilidade, verificável isoladamente) e se tem um **critério de aceite testável** (não vago como "funcionando bem", e sim comportamento observável).
4. Identifique riscos e pontos de erro comuns deste tipo de projeto (ex: mismatch entre schema Zod e frontmatter dos arquivos .md; itens do carrinho "fantasmas" no Local Storage após remoção de produto do catálogo; mensagem do WhatsApp mal codificada/URL encoding; imagens sem dimensões definidas causando layout shift) e inclua tarefas ou avisos específicos para mitigá-los.
5. Só depois disso, escreva o plano final.
</processo_de_raciocinio>

<requisitos_do_plano_de_saida>
O plano deve conter, nesta ordem:

1. **Sumário executivo do plano** (5–8 linhas: o que será construído e em quantas fases).
2. **Suposições assumidas** — qualquer ponto que não estava 100% explícito no contexto acima e que precisou de uma decisão (ex: quantidade exata de campos do produto, se haverá filtro por categoria na URL, etc.). Se não houver nenhuma suposição, declare isso explicitamente.
3. **Fases numeradas** (ex: Fase 0, Fase 1, Fase 2...), cada uma com:
   - Objetivo da fase em uma frase.
   - Lista de tarefas com **ID único** (ex: `F1-T1`, `F1-T2`).
   - Para cada tarefa:
     - **Ação**: o que exatamente deve ser feito (comando, arquivo a criar/editar, função a implementar).
     - **Arquivo(s) afetado(s)**: caminho exato, alinhado à estrutura de diretórios definida acima.
     - **Dependências**: quais IDs de tarefas precisam estar concluídos antes.
     - **Critério de aceite (Definition of Done)**: comportamento observável e testável, não opinião subjetiva.
4. **Checklist de QA final** — lista de verificações manuais/automatizadas antes de considerar o projeto pronto para produção (responsividade mobile, teste da jornada completa do carrinho, teste de geração da mensagem do WhatsApp em pelo menos 2 cenários — 1 item e múltiplos itens —, teste de persistência do Local Storage, Lighthouse/performance, meta tags e SEO básico, favicon, página 404).
5. **Riscos conhecidos e mitigação** — tabela ou lista curta dos principais pontos de falha antecipados e como cada tarefa do plano já os mitiga.
6. **Fora de escopo** — liste explicitamente o que este plano NÃO cobre (ex: gateway de pagamento real, painel administrativo, autenticação de usuário), para não haver expectativa equivocada.

As fases mínimas esperadas (o agente pode ajustar granularidade, mas não pode omitir nenhuma destas áreas):
- Fase 0 — Setup do projeto (Astro init, Tailwind, config inicial, estrutura de pastas)
- Fase 1 — Camada de dados (Content Collections, schema Zod, 2–3 produtos de exemplo por categoria)
- Fase 2 — Layout base e componentes de UI genéricos (Cabeçalho, Rodapé, Botão, Badge, Toast)
- Fase 3 — Vitrine e páginas de produto (grid com filtro por categoria, card de produto, galeria de fotos, seletor de tamanho com validação obrigatória)
- Fase 4 — Lógica do carrinho (cartStore.js, Custom Events, persistência em Local Storage)
- Fase 5 — UI do carrinho (ícone reativo, Offcanvas, item do carrinho com edição/remoção, subtotal)
- Fase 6 — Checkout via WhatsApp (utils/whatsappLink.js, formatCurrency.js, botão de finalizar pedido, formatação exata da mensagem)
- Fase 7 — QA, performance, SEO básico e acessibilidade
- Fase 8 — Deploy (escolha entre Vercel/Netlify/GitHub Pages, configuração de build, domínio)
</requisitos_do_plano_de_saida>

<formato_de_saida>
- Responda inteiramente em **português do Brasil**.
- Formate em Markdown, com cabeçalhos por fase e checkboxes (`- [ ]`) para cada tarefa.
- Use blocos de código para exemplos de schema, nomes de função ou estrutura de dados quando relevante.
- Não inclua nenhum texto de preenchimento, saudação ou explicação fora do plano em si — a resposta deve ser o documento do plano, pronto para ser copiado e usado diretamente.
- Seja explícito e literal nos caminhos de arquivo — nunca escreva algo como "crie os componentes necessários"; escreva o nome e caminho exato de cada arquivo.
</formato_de_saida>

<criterios_de_qualidade_antes_de_finalizar>
Antes de entregar a resposta final, verifique internamente:
- [ ] Toda tarefa referencia um caminho de arquivo exato, consistente com a estrutura de diretórios definida.
- [ ] Toda tarefa tem um critério de aceite testável (não subjetivo).
- [ ] As dependências entre tarefas formam um grafo sem ciclos e respeitam a ordem lógica de construção.
- [ ] Nenhuma tecnologia fora da stack definida foi introduzida.
- [ ] As regras de negócio (sem dados pessoais, sem pagamento no site, seleção de tamanho obrigatória, custo zero) estão refletidas em pelo menos uma tarefa cada.
- [ ] Itens "esquecíveis" foram cobertos: favicon, página 404, meta tags/SEO, robots.txt, responsividade mobile, estados de carrinho vazio, tratamento de imagem ausente/quebrada.
- [ ] O plano é suficientemente granular para ser executado por um agente sem que ele precise "adivinhar" nenhuma decisão de design ou nomenclatura.

Se qualquer item acima falhar, corrija o plano antes de responder.
</criterios_de_qualidade_antes_de_finalizar>

## [FIM DO PROMPT]

---

## Notas para você

- Este prompt foi propositalmente **redundante em alguns pontos** (ex: a estrutura de pastas aparece tanto na especificação técnica quanto reforçada no requisito de formato) — isso é intencional em prompt engineering para agentes de codificação: reduz a chance de o agente "esquecer" uma restrição ao longo de uma resposta longa.
- A seção `<processo_de_raciocinio>` força o agente a pensar em dependências e riscos *antes* de escrever, o que reduz retrabalho e planos com furos de ordenação (ex: tentar montar a UI do carrinho antes de o `cartStore.js` existir).
- Se quiser, posso adaptar este prompt para um formato mais curto (caso o agente que você vai usar tenha limite de contexto apertado) ou adicionar uma seção específica para geração de conteúdo de exemplo dos 30 produtos.
