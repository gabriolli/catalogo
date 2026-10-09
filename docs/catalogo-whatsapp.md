# Plano de Implementacao Tecnica -- Catalogo Digital com Checkout via WhatsApp

## Sumario Executivo

Este plano cobre a construcao completa de uma vitrine digital estatica para ~30 produtos (Moda Praia e Fitness), utilizando **Astro (SSG) + Tailwind CSS + JavaScript Vanilla**. O site permite ao cliente navegar por categorias, selecionar tamanhos, montar uma sacola persistente (Local Storage) e finalizar o pedido via redirecionamento ao WhatsApp do vendedor com mensagem pre-formatada. Nao ha coleta de dados pessoais, processamento de pagamento nem custo recorrente de infraestrutura.

O plano esta dividido em **9 fases sequenciais** (Fase 0 a Fase 8), totalizando **43 tarefas atomicas** com dependencias explicitas e criterios de aceite testaveis. A arquitetura segue o padrao Event-Driven Front-end com Separation of Concerns, preparada para evolucao futura a e-commerce completo.

---

## Suposicoes Assumidas

As seguintes decisoes foram tomadas por nao estarem 100% explicitas no contexto de negocio. Revise cada uma antes de iniciar a execucao:

1. **Numero do WhatsApp**: sera configurado como constante em `src/utils/whatsappLink.js`. O plano usa o placeholder `5500000000000` -- substituir pelo numero real antes do deploy.
2. **Moeda e locale**: `pt-BR`, moeda `BRL`. Formato: `R$ 129,90`.
3. **Filtro por categoria na vitrine**: sera feito via botoes de filtro client-side (JS Vanilla) na pagina `index.astro`, sem criar rotas separadas por categoria (ex: `/moda-praia`). Isso mantem a simplicidade do SSG. Se rotas por categoria forem desejadas, ajustar a Fase 3.
4. **Imagens por produto**: o schema suporta **multiplas imagens** por produto atraves do campo `imagens` (array de `image()`). A primeira imagem do array e usada como imagem principal (card na vitrine, thumbnail no carrinho). Todas as imagens sao exibidas na galeria da pagina de produto. Minimo obrigatorio: 1 imagem.
5. **Galeria de fotos na pagina de produto**: a pagina de produto exibe um componente `ProductGallery.astro` com a imagem principal em destaque e thumbnails navegaveis das demais imagens. A troca de imagem e feita via JS Vanilla (sem framework reativo).
6. **Breakpoints de responsividade**: mobile-first. Breakpoints padroes do Tailwind (`sm:640px`, `md:768px`, `lg:1024px`).
7. **Fonte tipografica**: sera utilizada a fonte `Inter` via Google Fonts como padrao inicial. A fonte e referenciada exclusivamente via CSS custom properties (`--font-sans`) em `src/styles/global.css`, permitindo troca futura alterando um unico lugar.
8. **Cor primaria da marca**: nao definida ainda. O plano usa uma paleta neutra provisoria com acentos em teal como placeholder. **Todas as cores sao definidas exclusivamente no `src/styles/global.css` (via `@theme` do Tailwind v4)**, de modo que a troca completa da paleta exige editar apenas esse arquivo. Nenhum componente deve usar cores hardcoded (hex/rgb diretos) -- apenas classes semanticas do Tailwind (`text-primary`, `bg-accent`, etc.).
9. **Quantidade de produtos de exemplo**: serao criados **3 produtos por categoria** (6 total) como seed. Os demais ~24 seguem o mesmo formato.
10. **Mensagem do WhatsApp**: formato definido na tarefa F6-T2. Exemplo:
    ```
    Ola! Gostaria de fazer o seguinte pedido:

    1x Biquini Tropicana (Ref: MP-001) - Tam: M - R$ 129,90
    2x Legging Power (Ref: FT-003) - Tam: G - R$ 89,90

    Total: R$ 309,70

    Aguardo informacoes sobre pagamento e entrega!
    ```

---

## Fase 0 -- Setup do Projeto

**Objetivo:** Inicializar o repositorio com Astro, Tailwind CSS e a estrutura de diretorios completa.

---

- [ ] **F0-T1 -- Criar projeto Astro**
  - **Acao:** Executar `npm create astro@latest ./meu-catalogo -- --template minimal --install --no-git --typescript strict` na raiz do workspace. Apos criacao, mover o conteudo de `meu-catalogo/` para a raiz do projeto ou inicializar diretamente na raiz.
  - **Arquivo(s) afetado(s):** `package.json`, `astro.config.mjs`, `tsconfig.json`
  - **Dependencias:** Nenhuma.
  - **Criterio de aceite:** `npm run dev` inicia o servidor local sem erros e exibe a pagina padrao do Astro em `http://localhost:4321`.

---

- [ ] **F0-T2 -- Instalar e configurar Tailwind CSS com design tokens centralizados**
  - **Acao:** Executar `npx astro add tailwind --yes`. O Astro instalara o Tailwind v4. Configurar o Tailwind como **unica fonte de verdade para design tokens**, facilitando troca futura de identidade visual. Adicionar ao arquivo `src/styles/global.css` (criado pelo Astro):
    - Bloco `@theme` definindo a paleta semantica provisoria:
      ```css
      @theme {
        --color-primary: #0D9488;
        --color-primary-hover: #0F766E;
        --color-accent: #14B8A6;
        --color-surface: #F8FAFC;
        --color-surface-alt: #F1F5F9;
        --color-dark: #0F172A;
        --color-dark-soft: #334155;
        --color-muted: #94A3B8;
        --color-border: #E2E8F0;
        --color-danger: #EF4444;
      }
      ```
    - Fonte e animacoes:
      ```css
      @theme {
        --font-sans: 'Inter', system-ui, sans-serif;
        --animate-shake: shake 0.4s ease-in-out;
      }
      ```
  - **Arquivo(s) afetado(s):** `src/styles/global.css`, `astro.config.mjs`, `package.json`
  - **Dependencias:** `F0-T1`
  - **Criterio de aceite:** Um elemento com classe Tailwind (ex: `<h1 class="text-3xl font-bold text-primary">Teste</h1>`) renderiza corretamente com a cor definida no config. O arquivo `global.css` contem todas as cores semanticas listadas.

---

- [ ] **F0-T3 -- Criar estrutura completa de diretorios**
  - **Acao:** Criar todos os diretorios e arquivos placeholder conforme a arvore abaixo. Arquivos `.gitkeep` nos diretorios vazios. Criar `public/robots.txt` com conteudo `User-agent: *\nAllow: /`.
  - **Arquivo(s) afetado(s):**
    ```
    public/robots.txt
    src/assets/          (.gitkeep)
    src/components/ui/   (.gitkeep)
    src/components/cart/  (.gitkeep)
    src/components/product/ (.gitkeep)
    src/content/produtos/  (.gitkeep)
    src/content/config.ts  (vazio por enquanto)
    src/layouts/           (.gitkeep)
    src/pages/index.astro  (placeholder)
    src/pages/produto/     (.gitkeep)
    src/pages/api/         (.gitkeep -- stub para futuro)
    src/store/             (.gitkeep)
    src/utils/             (.gitkeep)
    ```
  - **Dependencias:** `F0-T1`
  - **Criterio de aceite:** Executar `tree src` (ou equivalente) e a saida corresponde exatamente a arvore especificada. O arquivo `public/robots.txt` existe e contem o conteudo correto.

---

- [ ] **F0-T4 -- Configurar Astro para Content Collections e imagens**
  - **Acao:** Editar `astro.config.mjs`: garantir que `integrations` inclui `tailwind()`. Garantir que `image` esta habilitado (default no Astro 3+). Adicionar `site: 'https://meu-catalogo.vercel.app'` (placeholder, ajustar no deploy).
  - **Arquivo(s) afetado(s):** `astro.config.mjs`
  - **Dependencias:** `F0-T2`
  - **Criterio de aceite:** `npm run build` executa sem erros. O campo `site` aparece no config.

---

- [ ] **F0-T5 -- Criar favicon e assets iniciais com CSS custom properties**
  - **Acao:** Adicionar um `favicon.svg` minimalista em `public/favicon.svg` (icone de sacola de compras ou logotipo simples). Criar o arquivo `src/styles/global.css` (se nao existir) com:
    - Importacao da fonte Inter do Google Fonts via `@import url(...)` no TOPO do arquivo.
    - Estilos base: reset minimo, `scroll-behavior: smooth`, `font-family: var(--font-sans)`.
    - Animacao shake (usada na validacao de tamanho, Fase 3).
  - **Arquivo(s) afetado(s):** `public/favicon.svg`, `src/styles/global.css`
  - **Dependencias:** `F0-T3`
  - **Criterio de aceite:** O favicon aparece na aba do navegador ao acessar `localhost:4321`. A fonte Inter e carregada (inspecionar no DevTools > Network > Font). No DevTools > Elements > Computed, a variavel `--color-primary` e resolvida corretamente.

---

## Fase 1 -- Camada de Dados (Content Collections + Zod)

**Objetivo:** Definir o schema de validacao dos produtos e criar produtos de exemplo para ambas as categorias.

---

- [ ] **F1-T1 -- Implementar schema Zod em `content.config.ts`**
  - **Acao:** Criar `src/content.config.ts` (na raiz do src) com a definicao da collection `produtos`. O schema Zod deve validar os seguintes campos, incluindo `imagens` como **array de imagens** (minimo 1):
    ```ts
    import { defineCollection, z } from 'astro:content';
    import { glob } from 'astro/loaders';

    const produtosCollection = defineCollection({
      loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/produtos" }),
      schema: ({ image }) => z.object({
        id: z.string(),
        nome: z.string(),
        preco: z.number().positive(),
        tamanhos: z.array(z.enum(['P', 'M', 'G'])).nonempty(),
        imagens: z.array(image()).nonempty(),  // Array de imagens; a primeira e a principal
        categoria: z.enum(['moda-praia', 'fitness']),
        referencia: z.string(),
        descricao: z.string(),
      }),
    });

    export const collections = {
      produtos: produtosCollection,
    };
    ```
    **Convencao:** `imagens[0]` e sempre a imagem principal (usada no card da vitrine e no thumbnail do carrinho). As demais sao exibidas na galeria da pagina de produto.
  - **Arquivo(s) afetado(s):** `src/content.config.ts`
  - **Dependencias:** `F0-T3`
  - **Criterio de aceite:** `npm run build` executa sem erros de tipagem no schema. Importar `getCollection('produtos')` em um arquivo `.astro` de teste e verificar que retorna array vazio (sem produtos ainda). O campo `imagens` aceita array com 1+ imagens e rejeita array vazio.

---

- [ ] **F1-T2 -- Criar 3 produtos de exemplo para "moda-praia"**
  - **Acao:** Criar 3 arquivos `.md` em `src/content/produtos/` com frontmatter valido. Adicionar **multiplas imagens** por produto em `src/assets/produtos/` (usar subpastas por produto para organizacao: `src/assets/produtos/biquini-tropicana/`, etc., ou nomes prefixados: `biquini-tropicana-1.jpg`, `biquini-tropicana-2.jpg`). Nomes de arquivo: `biquini-tropicana.md`, `maio-oceano.md`, `saida-brisa.md`. Cada arquivo deve conter:
    ```md
    ---
    id: "mp-001"
    nome: "Biquini Tropicana"
    preco: 129.90
    tamanhos: ["P", "M", "G"]
    imagens:
      - "../../assets/produtos/biquini-tropicana-1.jpg"
      - "../../assets/produtos/biquini-tropicana-2.jpg"
      - "../../assets/produtos/biquini-tropicana-3.jpg"
    categoria: "moda-praia"
    referencia: "MP-001"
    descricao: "Biquini com estampa tropical, tecido com protecao UV 50+."
    ---

    Biquini com estampa tropical exclusiva. Tecido tecnologico com protecao UV 50+, 
    secagem rapida e toque macio. Ideal para praia e piscina.
    ```
    Repetir para os outros 2, variando `id`, `nome`, `preco`, `referencia`, `descricao`. Cada produto deve ter no minimo 2 imagens para testar a galeria.
  - **Arquivo(s) afetado(s):** `src/content/produtos/biquini-tropicana.md`, `src/content/produtos/maio-oceano.md`, `src/content/produtos/saida-brisa.md`, `src/assets/produtos/` (6-9 imagens total)
  - **Dependencias:** `F1-T1`
  - **Criterio de aceite:** `npm run build` passa sem erros. `getCollection('produtos')` retorna exatamente 3 itens. Cada item possui `imagens` como array com 2+ elementos. `imagens[0]` e acessivel como imagem principal.

---

- [ ] **F1-T3 -- Criar 3 produtos de exemplo para "fitness"**
  - **Acao:** Mesma estrutura da F1-T2, mas com `categoria: "fitness"`. Nomes: `legging-power.md`, `top-energy.md`, `shorts-flex.md`. Cada um com `id`, `nome`, `preco`, `tamanhos`, `imagens` (array com 2-3 imagens), `referencia`, `descricao` unicos.
  - **Arquivo(s) afetado(s):** `src/content/produtos/legging-power.md`, `src/content/produtos/top-energy.md`, `src/content/produtos/shorts-flex.md`, `src/assets/produtos/` (6-9 imagens)
  - **Dependencias:** `F1-T1`
  - **Criterio de aceite:** `getCollection('produtos')` retorna 6 itens total. Filtrar por `categoria === 'fitness'` retorna exatamente 3. Cada produto fitness possui `imagens` com 2+ elementos.

---

- [ ] **F1-T4 -- Validacao cruzada schema vs. frontmatter**
  - **Acao:** Executar `npm run build` e verificar que nao ha erros de validacao Zod. Criar temporariamente um produto com campo faltante (ex: sem `preco`) e confirmar que o build FALHA com erro explicito do Zod. Depois, remover o produto invalido.
  - **Arquivo(s) afetado(s):** Nenhum (teste destrutivo temporario).
  - **Dependencias:** `F1-T2`, `F1-T3`
  - **Criterio de aceite:** Build falha com mensagem de erro Zod clara ao omitir campo obrigatorio. Build passa com todos os 6 produtos validos.

---

## Fase 2 -- Layout Base e Componentes de UI Genericos

**Objetivo:** Criar o layout global (cabecalho + rodape) e componentes reutilizaveis (botao, badge, toast).

---

- [ ] **F2-T1 -- Criar layout base `BaseLayout.astro`**
  - **Acao:** Criar `src/layouts/BaseLayout.astro` com:
    - `<!DOCTYPE html>`, `<html lang="pt-BR">`
    - `<head>`: charset, viewport, favicon, meta description, meta og:image, `<title>` parametrizavel via prop, importacao do `global.css`, slot para meta tags adicionais.
    - `<body>`: slot para conteudo, importacao do cabecalho e rodape como componentes.
    - Estrutura: `<Header /> <main><slot /></main> <Footer />`
  - **Arquivo(s) afetado(s):** `src/layouts/BaseLayout.astro`
  - **Dependencias:** `F0-T5`
  - **Criterio de aceite:** Pagina `index.astro` usando `<BaseLayout title="Catalogo">` renderiza com `<title>Catalogo</title>`, favicon visivel, e meta tags presentes no HTML fonte.

---

- [ ] **F2-T2 -- Criar componente `Header.astro`**
  - **Acao:** Criar `src/components/ui/Header.astro` com:
    - Logo/nome da loja (texto ou SVG, lado esquerdo).
    - Navegacao: links "Inicio" e categorias (se aplicavel).
    - Icone do carrinho (lado direito) com badge de contagem. O badge inicia com `0` e sera atualizado via JS na Fase 5.
    - Fixo no topo (`sticky top-0 z-50`), com backdrop blur.
    - O botao do carrinho deve ter `id="cart-toggle"` e o badge `id="cart-count"`.
  - **Arquivo(s) afetado(s):** `src/components/ui/Header.astro`
  - **Dependencias:** `F2-T1`
  - **Criterio de aceite:** Header renderiza fixo no topo. Icone do carrinho visivel com badge "0". O header nao desaparece ao rolar a pagina.

---

- [ ] **F2-T3 -- Criar componente `Footer.astro`**
  - **Acao:** Criar `src/components/ui/Footer.astro` com:
    - Texto de copyright com ano dinamico (`new Date().getFullYear()`).
    - Link para WhatsApp do vendedor (icone + texto "Fale conosco").
    - Estilo minimalista, `bg-dark text-white`.
  - **Arquivo(s) afetado(s):** `src/components/ui/Footer.astro`
  - **Dependencias:** `F2-T1`
  - **Criterio de aceite:** Footer aparece no final da pagina. Link do WhatsApp abre `wa.me/NUMERO` em nova aba.

---

- [ ] **F2-T4 -- Criar componente `Toast.astro`**
  - **Acao:** Criar `src/components/ui/Toast.astro`. O componente e um container fixo (`fixed bottom-4 right-4 z-50`) inicialmente oculto (`hidden`). Contem texto dinamico e icone de check. Ele sera controlado via JS: ao receber o Custom Event `cart:item-added`, exibe com animacao slide-in, e desaparece automaticamente apos 3 segundos (CSS transition + `setTimeout`). O JS de controle do toast deve ficar inline no proprio componente dentro de `<script>`.
    - O container deve ter `id="toast-container"`.
    - Animacao de entrada: `translate-y-full → translate-y-0` com `transition-transform duration-300`.
  - **Arquivo(s) afetado(s):** `src/components/ui/Toast.astro`
  - **Dependencias:** `F2-T1`
  - **Criterio de aceite:** Disparar manualmente `window.dispatchEvent(new CustomEvent('cart:item-added', { detail: { nome: 'Teste' } }))` no console do navegador faz o toast aparecer com o nome do produto e desaparecer apos 3s.

---

- [ ] **F2-T5 -- Criar pagina 404 customizada**
  - **Acao:** Criar `src/pages/404.astro` usando `BaseLayout`. Exibir mensagem amigavel ("Pagina nao encontrada"), ilustracao simples (SVG inline ou emoji estilizado), e botao "Voltar a vitrine" que leva a `/`.
  - **Arquivo(s) afetado(s):** `src/pages/404.astro`
  - **Dependencias:** `F2-T1`
  - **Criterio de aceite:** Acessar `localhost:4321/pagina-inexistente` exibe a pagina 404 customizada com o layout base (header + footer).

---

## Fase 3 -- Vitrine e Paginas de Produto

**Objetivo:** Criar a pagina principal (grid de produtos com filtro por categoria) e as paginas individuais de produto com galeria e seletor de tamanho.

---

- [ ] **F3-T1 -- Criar componente `ProductCard.astro`**
  - **Acao:** Criar `src/components/product/ProductCard.astro`. Props: `id`, `nome`, `preco`, `imagens` (array), `categoria`, `referencia`. Exibir:
    - **Imagem principal** (`imagens[0]`) usando `<Image />` do Astro (conversao automatica a WebP, `width` e `height` definidos para evitar layout shift).
    - Nome do produto.
    - Preco formatado (usar `formatCurrency` -- sera criado na Fase 6, por enquanto hardcodar o formato ou criar um helper inline temporario).
    - Badge de categoria (`Moda Praia` ou `Fitness`).
    - Link para `/produto/{slug}` (onde slug = nome do arquivo .md sem extensao).
    - Card com `hover:scale-105 transition-transform` e sombra suave. Usar apenas classes semanticas do Tailwind (ex: `bg-surface`, `text-dark`, `border-border`) -- **nunca hex/rgb diretos**.
    - Atributo `data-categoria` no card para filtro JS.
  - **Arquivo(s) afetado(s):** `src/components/product/ProductCard.astro`
  - **Dependencias:** `F1-T4`, `F2-T1`
  - **Criterio de aceite:** O componente renderiza corretamente quando chamado com props de um produto. Apenas `imagens[0]` e exibida no card. A imagem esta em formato WebP no HTML gerado. O link aponta para a URL correta do produto. Nenhum valor de cor hardcoded (hex/rgb) existe no componente.

---

- [ ] **F3-T2 -- Implementar pagina vitrine `index.astro`**
  - **Acao:** Editar `src/pages/index.astro`:
    - Importar `getCollection('produtos')`.
    - Renderizar hero section com titulo da loja e subtitulo.
    - Renderizar botoes de filtro: "Todos", "Moda Praia", "Fitness" com estilos de botao ativo/inativo.
    - Renderizar grid responsivo de `ProductCard` (1 coluna mobile, 2 colunas tablet, 3 colunas desktop).
    - Adicionar `<script>` inline com logica de filtro: ao clicar em um botao de categoria, esconder/mostrar cards via `data-categoria` (toggle `hidden` class). Botao ativo recebe classe visual diferenciada.
  - **Arquivo(s) afetado(s):** `src/pages/index.astro`
  - **Dependencias:** `F3-T1`
  - **Criterio de aceite:** Pagina exibe 6 produtos. Clicar em "Moda Praia" mostra apenas 3. Clicar em "Fitness" mostra apenas 3. Clicar em "Todos" mostra 6. Grid e responsivo (testar via DevTools).

---

- [ ] **F3-T3 -- Criar componente `SizeSelector.astro`**
  - **Acao:** Criar `src/components/product/SizeSelector.astro`. Props: `tamanhos` (array de `'P' | 'M' | 'G'`), `productId` (string). Renderizar botoes para cada tamanho disponivel. Ao clicar, o botao selecionado recebe classe visual de "ativo" (ex: `bg-primary text-white`). O tamanho selecionado e armazenado em um `data-selected-size` no container do seletor (`id="size-selector-{productId}"`). Se nenhum tamanho estiver selecionado, o valor e vazio.
    - Logica JS inline: `querySelectorAll` nos botoes, toggle de classe, set de `dataset.selectedSize`.
  - **Arquivo(s) afetado(s):** `src/components/product/SizeSelector.astro`
  - **Dependencias:** `F2-T1`
  - **Criterio de aceite:** Na pagina de produto, clicar em "M" marca o botao como ativo e seta `data-selected-size="M"`. Clicar em "G" desmarca "M" e marca "G".

---

- [ ] **F3-T4 -- Criar componente `ProductGallery.astro`**
  - **Acao:** Criar `src/components/product/ProductGallery.astro`. Props: `imagens` (array de imagens processadas pelo Astro), `nomeParaAlt` (string). Exibir:
    - **Imagem principal em destaque** (`id="gallery-main-img"`): exibe `imagens[0]` inicialmente, ocupa largura total do container, usa `<Image />` do Astro com `width` e `height` definidos.
    - **Linha de thumbnails** abaixo da imagem principal (exibida apenas se `imagens.length > 1`): cada thumbnail e uma miniatura clicavel (64x64px ou proporcional) com borda. O thumbnail ativo recebe borda na cor `primary` (`border-primary`), os demais borda neutra (`border-border`).
    - `<script>` inline com logica de troca de imagem:
      1. Ao clicar em um thumbnail, trocar o `src` e `srcset` da imagem principal pelo da imagem correspondente.
      2. Atualizar a borda ativa no thumbnail clicado.
      3. Usar event delegation no container de thumbnails.
    - Container da galeria: `id="product-gallery"`.
    - Layout responsivo: em mobile, thumbnails ficam em scroll horizontal; em desktop, ficam alinhados abaixo.
  - **Arquivo(s) afetado(s):** `src/components/product/ProductGallery.astro`
  - **Dependencias:** `F2-T1`
  - **Criterio de aceite:**
    1. Com 3 imagens, a galeria exibe a primeira em destaque e 3 thumbnails abaixo.
    2. Clicar no segundo thumbnail troca a imagem principal para a segunda imagem.
    3. Com 1 imagem, a galeria exibe apenas a imagem principal sem area de thumbnails.
    4. Todas as imagens sao servidas em WebP via `<Image />`.

---

- [ ] **F3-T5 -- Criar pagina de produto `[slug].astro`**
  - **Acao:** Criar `src/pages/produto/[slug].astro` com rota dinamica baseada no slug do Content Collection:
    - Usar `getCollection('produtos')` e `getEntry` para buscar o produto pelo slug.
    - Exibir: `<ProductGallery imagens={produto.data.imagens} nomeParaAlt={produto.data.nome} />`, nome, preco formatado, descricao completa (body do .md), referencia, `SizeSelector`, botao "Adicionar a Sacola".
    - Layout da pagina de produto: em desktop, galeria a esquerda (60% da largura) e informacoes a direita (40%). Em mobile, galeria em cima, informacoes embaixo (empilhado).
    - Botao "Adicionar a Sacola": `id="add-to-cart-btn"`. Ao clicar, o JS verifica se um tamanho foi selecionado:
      - **Se sim:** dispara `CustomEvent('cart:add', { detail: { id, nome, preco, tamanho, referencia, imagem: imagens[0] } })` e `CustomEvent('cart:item-added', { detail: { nome } })` (para o toast). Nota: apenas `imagens[0]` e enviada ao carrinho (thumbnail).
      - **Se nao:** aplica animacao shake no `SizeSelector` (classe `animate-shake` por 500ms, depois remove). **NAO usar `alert()`**.
    - Implementar `getStaticPaths()` retornando todos os slugs de produtos.
    - A animacao shake ja deve estar definida em `global.css` (tarefa `F0-T5`).
  - **Arquivo(s) afetado(s):** `src/pages/produto/[slug].astro`
  - **Dependencias:** `F3-T3`, `F3-T4`, `F1-T4`
  - **Criterio de aceite:**
    1. Acessar `/produto/biquini-tropicana` exibe o produto correto com galeria funcional (multiplas imagens navegaveis).
    2. Clicar em "Adicionar a Sacola" sem tamanho selecionado causa animacao shake no seletor.
    3. Selecionar "M" e clicar em "Adicionar a Sacola" dispara o Custom Event `cart:add` com `imagem` sendo `imagens[0]` (verificar no console).
    4. O toast aparece apos adicionar com sucesso.
    5. Layout responsivo: galeria + info lado a lado em desktop, empilhados em mobile.

---

## Fase 4 -- Logica do Carrinho

**Objetivo:** Implementar `cartStore.js` com persistencia em Local Storage e comunicacao via Custom Events.

---

- [ ] **F4-T1 -- Implementar `cartStore.js`**
  - **Acao:** Criar `src/store/cartStore.js` com as seguintes funcoes exportadas:
    ```js
    // Estrutura de um item no carrinho:
    // { id: string, nome: string, preco: number, tamanho: string, referencia: string, imagem: string, quantidade: number }

    const STORAGE_KEY = 'catalogo-cart';

    export function getCart() { ... }         // Retorna array de itens do localStorage (ou [])
    export function addItem(item) { ... }     // Adiciona item ou incrementa quantidade se mesmo id+tamanho ja existe
    export function removeItem(id, tamanho) { ... }  // Remove item especifico (por id+tamanho)
    export function updateQuantity(id, tamanho, qty) { ... }  // Atualiza quantidade; se qty <= 0, remove
    export function getTotal() { ... }        // Retorna soma de (preco * quantidade) de todos os itens
    export function getItemCount() { ... }    // Retorna soma de todas as quantidades
    export function clearCart() { ... }       // Limpa o carrinho
    ```
    - Todas as funcoes de escrita (`addItem`, `removeItem`, `updateQuantity`, `clearCart`) devem:
      1. Atualizar o Local Storage.
      2. Disparar `window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: getCart(), count: getItemCount(), total: getTotal() } }))`.
    - A chave de identificacao unica de um item no carrinho e a combinacao `id + tamanho` (o mesmo produto em tamanhos diferentes sao itens separados).
    - Tratar gracefully erros de `JSON.parse` do Local Storage (se dado corrompido, resetar para `[]`).
  - **Arquivo(s) afetado(s):** `src/store/cartStore.js`
  - **Dependencias:** Nenhuma (modulo puro, sem dependencia visual).
  - **Criterio de aceite:**
    1. No console do navegador: `import('/src/store/cartStore.js').then(m => { m.addItem({id:'1',nome:'Teste',preco:100,tamanho:'M',referencia:'T-01',imagem:'',quantidade:1}); console.log(m.getCart()); })` retorna array com 1 item.
    2. Fechar a aba, reabrir, e `getCart()` retorna o mesmo item (persistencia).
    3. Adicionar o mesmo `id+tamanho` duas vezes incrementa `quantidade` para 2 (nao duplica item).
    4. `removeItem('1', 'M')` remove o item e `getCart()` retorna `[]`.

---

- [ ] **F4-T2 -- Conectar evento `cart:add` ao `cartStore`**
  - **Acao:** No layout base (`BaseLayout.astro`) ou em um `<script>` global, adicionar listener para `cart:add`:
    ```js
    import { addItem } from '../store/cartStore.js';

    window.addEventListener('cart:add', (e) => {
      addItem({ ...e.detail, quantidade: 1 });
    });
    ```
    Isso conecta o botao "Adicionar a Sacola" (que dispara `cart:add`) ao store.
  - **Arquivo(s) afetado(s):** `src/layouts/BaseLayout.astro` (ou script separado importado no layout)
  - **Dependencias:** `F4-T1`, `F3-T5`
  - **Criterio de aceite:** Na pagina de produto, selecionar tamanho e clicar em "Adicionar a Sacola" adiciona o item ao Local Storage. Verificar via DevTools > Application > Local Storage > `catalogo-cart`.

---

## Fase 5 -- UI do Carrinho

**Objetivo:** Criar o icone reativo com contagem, a gaveta lateral (Offcanvas) com lista de itens, edicao de quantidade, remocao e subtotal.

---

- [ ] **F5-T1 -- Atualizar badge de contagem do carrinho no Header**
  - **Acao:** No componente `Header.astro`, adicionar `<script>` que:
    1. Ao carregar a pagina (`DOMContentLoaded`), importar `getItemCount` do `cartStore.js` e atualizar o texto do `#cart-count` com o valor atual.
    2. Escutar `cart:updated` e atualizar `#cart-count` com `e.detail.count`.
    3. Se `count === 0`, adicionar classe `hidden` ao badge. Se `count > 0`, remover `hidden`.
  - **Arquivo(s) afetado(s):** `src/components/ui/Header.astro`
  - **Dependencias:** `F4-T1`, `F2-T2`
  - **Criterio de aceite:** Adicionar um item ao carrinho faz o badge mudar de `hidden` para visivel com o numero correto. Adicionar mais itens incrementa o numero em tempo real sem reload.

---

- [ ] **F5-T2 -- Criar componente `CartItem.astro`**
  - **Acao:** Criar `src/components/cart/CartItem.astro`. Props: `id`, `nome`, `preco`, `tamanho`, `referencia`, `imagem`, `quantidade`. Renderizar:
    - Thumbnail da imagem (40x40px).
    - Nome + tamanho.
    - Preco unitario formatado.
    - Controles de quantidade: botao `-` (decrementa), display da quantidade, botao `+` (incrementa).
    - Botao de remover (icone X ou lixeira).
    - Subtotal do item (`preco * quantidade`), formatado.
    - Atributos `data-item-id` e `data-item-tamanho` no container para identificacao no JS.
  - **Arquivo(s) afetado(s):** `src/components/cart/CartItem.astro`
  - **Dependencias:** `F2-T1`
  - **Criterio de aceite:** O componente renderiza todos os dados do item corretamente quando chamado com props validas.

---

- [ ] **F5-T3 -- Criar componente `CartOffcanvas.astro`**
  - **Acao:** Criar `src/components/cart/CartOffcanvas.astro`:
    - Container fixo (`fixed inset-0 z-50`), inicialmente oculto (`hidden`).
    - Overlay escuro semi-transparente (`bg-black/50`) que ao clicar fecha o offcanvas.
    - Painel lateral direito (`right-0 w-full max-w-md`) com animacao slide-in (`translate-x-full → translate-x-0 transition-transform duration-300`).
    - Cabecalho do painel: "Sua Sacola" + botao fechar (X), `id="cart-close"`.
    - Area de conteudo: `id="cart-items-container"` -- sera populada dinamicamente via JS.
    - Rodape do painel: total geral (`id="cart-total"`), botao "Finalizar no WhatsApp" (`id="checkout-whatsapp-btn"`), botao "Continuar Comprando" (fecha o offcanvas).
    - Estado vazio: quando carrinho estiver vazio, exibir mensagem "Sua sacola esta vazia" com icone e link "Ver produtos".
    - O container do offcanvas deve ter `id="cart-offcanvas"`.
    - `<script>` inline com logica de:
      1. Abrir: `#cart-toggle` (no Header) clica → remove `hidden`, inicia animacao slide-in.
      2. Fechar: `#cart-close` ou overlay clica → animacao slide-out, depois adiciona `hidden`.
      3. Escutar `cart:updated` → re-renderizar a lista de itens dinamicamente (criar HTML dos itens via JS, inserir no `#cart-items-container`, atualizar `#cart-total`).
      4. Delegar eventos de clique nos botoes `+`, `-`, remover dentro do container de itens (event delegation).
      5. Ao carregar a pagina, popular com o estado atual do carrinho (para sessoes persistidas).
  - **Arquivo(s) afetado(s):** `src/components/cart/CartOffcanvas.astro`
  - **Dependencias:** `F5-T2`, `F4-T1`
  - **Criterio de aceite:**
    1. Clicar no icone do carrinho (Header) abre a gaveta lateral com animacao.
    2. Clicar no overlay ou no X fecha a gaveta.
    3. Com itens no carrinho, a lista exibe cada item com nome, tamanho, preco, quantidade e subtotal.
    4. Clicar em `+` incrementa quantidade e atualiza subtotal e total.
    5. Clicar em `-` decrementa quantidade. Se chegar a 0, remove o item.
    6. Clicar em remover remove o item imediatamente.
    7. Carrinho vazio exibe mensagem "Sua sacola esta vazia".

---

- [ ] **F5-T4 -- Incluir CartOffcanvas e Toast no layout base**
  - **Acao:** Editar `BaseLayout.astro` para incluir `<CartOffcanvas />` e `<Toast />` no final do `<body>`, antes do `</body>`. Isso garante que ambos estejam disponiveis em todas as paginas.
  - **Arquivo(s) afetado(s):** `src/layouts/BaseLayout.astro`
  - **Dependencias:** `F5-T3`, `F2-T4`
  - **Criterio de aceite:** Em qualquer pagina do site, o offcanvas e o toast funcionam corretamente.

---

## Fase 6 -- Checkout via WhatsApp

**Objetivo:** Implementar a formatacao de moeda, a geracao da URL do WhatsApp com mensagem pre-formatada, e conectar ao botao de finalizar pedido.

---

- [ ] **F6-T1 -- Implementar `formatCurrency.js`**
  - **Acao:** Criar `src/utils/formatCurrency.js`:
    ```js
    /**
     * Formata um valor numerico para moeda brasileira.
     * @param {number} value - Valor numerico (ex: 129.9)
     * @returns {string} Valor formatado (ex: "R$ 129,90")
     */
    export function formatCurrency(value) {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    }
    ```
  - **Arquivo(s) afetado(s):** `src/utils/formatCurrency.js`
  - **Dependencias:** Nenhuma.
  - **Criterio de aceite:** `formatCurrency(129.9)` retorna `"R$ 129,90"`. `formatCurrency(0)` retorna `"R$ 0,00"`. `formatCurrency(1500)` retorna `"R$ 1.500,00"`.

---

- [ ] **F6-T2 -- Implementar `whatsappLink.js`**
  - **Acao:** Criar `src/utils/whatsappLink.js`:
    ```js
    import { formatCurrency } from './formatCurrency.js';

    const WHATSAPP_NUMBER = '5500000000000'; // SUBSTITUIR pelo numero real

    /**
     * Gera a URL wa.me com a mensagem do pedido pre-formatada.
     * @param {Array} cartItems - Array de itens do carrinho
     * @param {number} total - Valor total do pedido
     * @returns {string} URL completa do WhatsApp
     */
    export function generateWhatsAppLink(cartItems, total) {
      const itemsText = cartItems
        .map(
          (item) =>
            `${item.quantidade}x ${item.nome} (Ref: ${item.referencia}) - Tam: ${item.tamanho} - ${formatCurrency(item.preco)}`
        )
        .join('\n');

      const message = `Ola! Gostaria de fazer o seguinte pedido:\n\n${itemsText}\n\nTotal: ${formatCurrency(total)}\n\nAguardo informacoes sobre pagamento e entrega!`;

      const encodedMessage = encodeURIComponent(message);
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    }
    ```
  - **Arquivo(s) afetado(s):** `src/utils/whatsappLink.js`
  - **Dependencias:** `F6-T1`
  - **Criterio de aceite:**
    1. Com 1 item: a URL gerada, ao ser decodificada (`decodeURIComponent`), contem o nome, referencia, tamanho, preco e total corretos.
    2. Com 3 itens: todos os itens aparecem, cada um em uma linha, e o total e a soma correta.
    3. Caracteres especiais (acentos, cedilha) sao corretamente codificados na URL (`encodeURIComponent`).
    4. A URL comeca com `https://wa.me/55...`.

---

- [ ] **F6-T3 -- Conectar botao "Finalizar no WhatsApp" ao `whatsappLink.js`**
  - **Acao:** No `<script>` do `CartOffcanvas.astro`, adicionar handler para o botao `#checkout-whatsapp-btn`:
    ```js
    import { getCart, getTotal } from '../../store/cartStore.js';
    import { generateWhatsAppLink } from '../../utils/whatsappLink.js';

    document.getElementById('checkout-whatsapp-btn').addEventListener('click', () => {
      const cart = getCart();
      if (cart.length === 0) return; // Nao redirecionar com carrinho vazio
      const total = getTotal();
      const url = generateWhatsAppLink(cart, total);
      window.open(url, '_blank');
    });
    ```
    - O botao deve ficar desabilitado (`disabled`, visualmente opaco) quando o carrinho estiver vazio.
  - **Arquivo(s) afetado(s):** `src/components/cart/CartOffcanvas.astro`
  - **Dependencias:** `F6-T2`, `F5-T3`
  - **Criterio de aceite:**
    1. Com itens no carrinho, clicar em "Finalizar no WhatsApp" abre nova aba/janela com a URL `wa.me` correta.
    2. A mensagem no WhatsApp exibe todos os itens, tamanhos, quantidades, precos e total formatados corretamente.
    3. Com carrinho vazio, o botao esta desabilitado e nao redireciona.

---

- [ ] **F6-T4 -- Substituir formatacao hardcoded de preco nos componentes**
  - **Acao:** Nos componentes `ProductCard.astro`, `[slug].astro` e `CartOffcanvas.astro`, substituir qualquer formatacao hardcoded de preco pelo uso de `formatCurrency()`. Para componentes `.astro` (server-side), importar e usar diretamente. Para scripts client-side, importar como modulo.
  - **Arquivo(s) afetado(s):** `src/components/product/ProductCard.astro`, `src/pages/produto/[slug].astro`, `src/components/cart/CartOffcanvas.astro`
  - **Dependencias:** `F6-T1`
  - **Criterio de aceite:** Todos os precos no site exibem no formato `R$ 129,90`. Nenhum preco aparece como `129.9` ou `$129.90`.

---

## Fase 7 -- QA, Performance, SEO e Acessibilidade

**Objetivo:** Garantir qualidade, performance, SEO basico e acessibilidade antes do deploy.

---

- [ ] **F7-T1 -- Meta tags e SEO basico**
  - **Acao:** Editar `BaseLayout.astro`:
    - Adicionar meta `description` parametrizavel via prop (default: descricao da loja).
    - Adicionar meta `og:title`, `og:description`, `og:image`, `og:type` (website).
    - Adicionar `<link rel="canonical" href={Astro.url}>`.
    - Na pagina `index.astro`, passar titulo e descricao customizados.
    - Na pagina `[slug].astro`, usar nome e descricao do produto como meta.
    - Garantir `<h1>` unico por pagina.
  - **Arquivo(s) afetado(s):** `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/pages/produto/[slug].astro`
  - **Dependencias:** `F3-T4`
  - **Criterio de aceite:** Inspecionar HTML fonte de `index.astro` e `[slug].astro` — ambas possuem `title`, `meta description`, `og:*`, `canonical`, e apenas um `<h1>`.

---

- [ ] **F7-T2 -- Responsividade mobile**
  - **Acao:** Testar todas as paginas nos breakpoints: 375px (iPhone SE), 768px (tablet), 1024px (desktop), 1440px (widescreen). Ajustar:
    - Grid de produtos: 1 coluna em mobile, 2 em tablet, 3 em desktop.
    - Offcanvas: `w-full` em mobile, `max-w-md` em desktop.
    - Header: logo e icone do carrinho devem caber em telas de 320px.
    - Imagens: `object-cover` para evitar distorcao.
    - Textos: tamanhos legiveis (`text-sm` min em mobile).
  - **Arquivo(s) afetado(s):** Todos os componentes e paginas (ajustes de classes Tailwind).
  - **Dependencias:** `F5-T4`, `F6-T4`
  - **Criterio de aceite:** Nenhum scroll horizontal em nenhum breakpoint. Todos os elementos interativos sao tocaveis com o polegar (min 44x44px). Layout nao quebra em nenhuma largura entre 320px e 1440px.

---

- [ ] **F7-T3 -- Acessibilidade basica**
  - **Acao:**
    - Adicionar `aria-label` em todos os botoes sem texto visivel (icone do carrinho, botoes +/-/remover, fechar offcanvas).
    - Adicionar `alt` descritivo em todas as imagens de produto (usar `nome` do produto).
    - Garantir contraste minimo AA (4.5:1) nas combinacoes de cor usadas.
    - Adicionar `role="dialog"` e `aria-modal="true"` no offcanvas.
    - Adicionar `role="alert"` no toast.
    - Testar navegacao por teclado (Tab) no offcanvas: foco deve ficar preso dentro enquanto aberto (focus trap basico).
  - **Arquivo(s) afetado(s):** Todos os componentes que possuem elementos interativos.
  - **Dependencias:** `F5-T4`
  - **Criterio de aceite:** Rodar Lighthouse na pagina principal: score de Accessibility >= 90. Todos os botoes de icone possuem `aria-label`. Todas as imagens possuem `alt`.

---

- [ ] **F7-T4 -- Teste da jornada completa do carrinho**
  - **Acao:** Teste manual end-to-end, documentando cada passo:
    1. Acessar a vitrine. Filtrar por "Fitness". Verificar que so aparecem produtos de fitness.
    2. Clicar em um produto. Tentar adicionar sem tamanho → animacao shake.
    3. Selecionar tamanho "M". Adicionar → toast aparece, badge atualiza para 1.
    4. Voltar a vitrine. Adicionar outro produto (tamanho "G") → badge atualiza para 2.
    5. Abrir sacola. Verificar 2 itens com dados corretos.
    6. Incrementar quantidade do primeiro item → subtotal e total atualizam.
    7. Remover segundo item → total atualiza, 1 item restante.
    8. Clicar "Finalizar no WhatsApp" → nova aba abre com URL `wa.me` contendo mensagem correta.
    9. Fechar aba, reabrir o site → carrinho persistido com 1 item (Local Storage).
    10. Limpar carrinho → mensagem "sacola vazia".
  - **Arquivo(s) afetado(s):** Nenhum (teste).
  - **Dependencias:** `F6-T3`
  - **Criterio de aceite:** Todos os 10 passos completados com sucesso, sem erros no console, sem comportamentos inesperados.

---

- [ ] **F7-T5 -- Teste de mensagem WhatsApp em cenarios multiplos**
  - **Acao:** Testar a geracao da URL do WhatsApp em pelo menos 3 cenarios:
    1. **1 item, quantidade 1**: mensagem com 1 linha de produto.
    2. **3 itens, quantidades variadas**: mensagem com 3 linhas, total correto.
    3. **Produto com caracteres especiais no nome** (acentos, cedilha): URL encoding correto.
    Decodificar a URL gerada (`decodeURIComponent`) e validar visualmente.
  - **Arquivo(s) afetado(s):** Nenhum (teste).
  - **Dependencias:** `F6-T2`
  - **Criterio de aceite:** Em todos os 3 cenarios, a mensagem decodificada esta formatada corretamente, com todos os dados do pedido, sem caracteres quebrados.

---

- [ ] **F7-T6 -- Lighthouse e performance**
  - **Acao:** Executar Lighthouse (via DevTools ou CLI) na pagina principal e em uma pagina de produto. Metas:
    - Performance: >= 90
    - Accessibility: >= 90
    - Best Practices: >= 90
    - SEO: >= 90
    Se nao atingir, corrigir: lazy loading de imagens fora da viewport, preconnect para Google Fonts, minimizar JS, etc.
  - **Arquivo(s) afetado(s):** Variaveis conforme necessidade de otimizacao.
  - **Dependencias:** `F7-T1`, `F7-T2`, `F7-T3`
  - **Criterio de aceite:** Scores do Lighthouse >= 90 nas 4 categorias, em ambas as paginas testadas.

---

## Fase 8 -- Deploy

**Objetivo:** Publicar o site em hospedagem gratuita com build automatico.

---

- [ ] **F8-T1 -- Preparar para deploy na Vercel**
  - **Acao:**
    - Instalar adapter se necessario: `npx astro add vercel --yes` (para SSG puro, o adapter nao e obrigatorio, mas garante compatibilidade).
    - Verificar que `astro.config.mjs` tem `output: 'static'` (default).
    - Atualizar `site` no config com o dominio final (apos obter da Vercel).
    - Executar `npm run build` localmente e verificar que a pasta `dist/` e gerada sem erros.
    - Criar arquivo `vercel.json` na raiz (se necessario para configuracao de headers, redirects, etc.) -- para SSG puro, geralmente nao e necessario.
  - **Arquivo(s) afetado(s):** `astro.config.mjs`, `package.json`, opcionalmente `vercel.json`
  - **Dependencias:** `F7-T6`
  - **Criterio de aceite:** `npm run build` gera `dist/` sem erros. Os arquivos HTML em `dist/` sao validos e contem o conteudo esperado.

---

- [ ] **F8-T2 -- Deploy e verificacao em producao**
  - **Acao:**
    - Conectar repositorio Git a Vercel (ou Netlify/GitHub Pages).
    - Configurar build command: `npm run build`, output directory: `dist`.
    - Realizar primeiro deploy.
    - Verificar:
      - Pagina principal carrega corretamente.
      - Paginas de produto carregam com imagens otimizadas.
      - Carrinho funciona (Local Storage persiste).
      - Botao WhatsApp gera URL correta.
      - Pagina 404 customizada funciona.
      - Favicon visivel.
      - HTTPS ativo.
      - `robots.txt` acessivel em `/robots.txt`.
  - **Arquivo(s) afetado(s):** Nenhum (configuracao de plataforma).
  - **Dependencias:** `F8-T1`
  - **Criterio de aceite:** Todos os itens de verificacao acima confirmados na URL de producao. Site acessivel publicamente, sem erros no console, com HTTPS.

---

## Checklist de QA Final

Antes de considerar o projeto pronto para producao, verificar **todos** os itens:

- [ ] **Responsividade**: testado em 375px, 768px, 1024px, 1440px. Sem scroll horizontal.
- [ ] **Jornada do carrinho**: fluxo completo (navegar → selecionar tamanho → adicionar → revisar → editar quantidade → remover → finalizar no WhatsApp) funciona sem erros.
- [ ] **Mensagem WhatsApp (1 item)**: URL gerada corretamente, mensagem legivel apos decodificacao.
- [ ] **Mensagem WhatsApp (multiplos itens)**: todos os itens listados, total correto.
- [ ] **Persistencia Local Storage**: fechar aba e reabrir mantem os itens do carrinho.
- [ ] **Selecao de tamanho obrigatoria**: tentar adicionar sem tamanho causa shake, nao adiciona ao carrinho.
- [ ] **Toast de confirmacao**: aparece ao adicionar item, desaparece apos ~3s.
- [ ] **Badge do carrinho**: atualiza em tempo real ao adicionar/remover itens.
- [ ] **Filtro por categoria**: funciona na vitrine (Todos / Moda Praia / Fitness).
- [ ] **Imagens em WebP**: verificar no DevTools > Network que imagens sao servidas em WebP.
- [ ] **Galeria de produto**: clicar em thumbnails troca a imagem principal. Com 1 imagem, thumbnails nao aparecem.
- [ ] **Design tokens**: alterar `primary` no `src/styles/global.css` para outra cor, rebuildar, e verificar que todo o site reflete a mudanca sem editar nenhum componente.
- [ ] **Lighthouse Performance >= 90**
- [ ] **Lighthouse Accessibility >= 90**
- [ ] **Lighthouse Best Practices >= 90**
- [ ] **Lighthouse SEO >= 90**
- [ ] **Meta tags**: `title`, `description`, `og:*`, `canonical` presentes em todas as paginas.
- [ ] **Favicon**: visivel na aba do navegador.
- [ ] **Pagina 404**: acessar URL inexistente exibe pagina customizada.
- [ ] **robots.txt**: acessivel em `/robots.txt`.
- [ ] **Sem erros no console**: navegar por todo o site sem erros JS no console.
- [ ] **Sem dados pessoais coletados**: nenhum formulario de nome, email, endereco ou cartao existe no site.
- [ ] **HTTPS ativo**: site servido via HTTPS em producao.

---

## Riscos Conhecidos e Mitigacao

| # | Risco | Impacto | Mitigacao no Plano |
|---|-------|---------|-------------------|
| 1 | **Mismatch schema Zod vs. frontmatter** -- campo faltante ou tipo errado em algum `.md` | Build falha silenciosamente ou com erro criptico | `F1-T4` testa explicitamente a validacao cruzada. Build com Astro Content Collections falha de forma barulhenta por default. |
| 2 | **Itens "fantasmas" no Local Storage** -- produto removido do catalogo mas ainda no carrinho do usuario | Item aparece no carrinho sem dados (nome undefined, imagem quebrada) | `F5-T3` deve tratar itens com dados incompletos gracefully (exibir "Produto indisponivel" ou filtrar na renderizacao). Incluir validacao no `getCart()` que filtra itens cujo `id` nao esta mais no catalogo -- porem, como o catalogo e estatico, isso so seria um problema ao remover produtos e o usuario ter cache antigo. Alternativa pragmatica: ao renderizar o carrinho, tratar `undefined` com fallbacks. |
| 3 | **URL encoding da mensagem WhatsApp** -- caracteres especiais (acentos, emojis, quebras de linha) mal codificados | Mensagem chega ilegivel no WhatsApp | `F6-T2` usa `encodeURIComponent` que trata todos esses casos. `F7-T5` testa explicitamente com caracteres especiais. |
| 4 | **Layout shift por imagens sem dimensoes** | CLS ruim no Lighthouse, experiencia visual instavel | `F3-T1`, `F3-T4` e `F3-T5` usam `<Image />` do Astro com `width`/`height` explicitos. |
| 8 | **Galeria com quantidade variavel de imagens** -- produto com 1 imagem vs. produto com 5 imagens | Layout inconsistente, thumbnails desnecessarios com 1 imagem | `F3-T4` (ProductGallery) oculta a area de thumbnails quando `imagens.length === 1`. Container da imagem principal tem dimensoes fixas com `object-cover` para manter proporcao independente do numero de imagens. |
| 5 | **Local Storage indisponivel** -- modo privado em Safari, storage cheio | Carrinho nao persiste, possivel erro JS | `F4-T1` envolve acesso ao Local Storage em try/catch. Em caso de falha, carrinho funciona em memoria (session only) sem quebrar o site. |
| 6 | **Numero do WhatsApp hardcoded incorreto** | Pedidos vao para o numero errado ou URL invalida | Documentado na secao "Suposicoes Assumidas". Constante isolada em unico arquivo (`whatsappLink.js`), facil de localizar e alterar. |
| 7 | **Imagem de produto ausente ou quebrada** | Card mostra espaco vazio ou icone quebrado | Componentes de imagem devem ter fallback CSS (`bg-gray-200` no container) e `alt` descritivo. |

---

## Fora de Escopo

Os seguintes itens **NAO** sao cobertos por este plano e **NAO** devem ser implementados:

- Gateway de pagamento real (Stripe, Mercado Pago, Pix automatizado).
- Painel administrativo para gestao de produtos (CRUD via interface web).
- Autenticacao ou cadastro de usuarios.
- Banco de dados (PostgreSQL, MongoDB, Firebase, etc.).
- CMS headless pago (Contentful, Sanity, etc.).
- Sistema de busca por texto (search).
- Avaliacoes/reviews de produtos.
- Sistema de cupons de desconto.
- Calculo de frete.
- Notificacoes push ou email.
- Integracao com ERP ou sistema de estoque.
- Analytics avancado (apenas meta tags basicas para compartilhamento social).
- Internacionalizacao (i18n) -- o site e exclusivamente em pt-BR.
- Testes automatizados (unit tests, E2E) -- apenas testes manuais estao previstos nesta versao. Testes automatizados podem ser adicionados como evolucao futura.
