import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const produtosCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/produtos" }),
  schema: ({ image }) => z.object({
    id: z.string(),
    nome: z.string(),
    preco: z.number().positive(),
    tamanhos: z.array(z.enum(['P', 'M', 'G'])).nonempty(),
    imagens: z.array(image()).nonempty(),
    categoria: z.enum(['moda-praia', 'fitness']),
    referencia: z.string(),
    descricao: z.string(),
  }),
});

export const collections = {
  produtos: produtosCollection,
};
