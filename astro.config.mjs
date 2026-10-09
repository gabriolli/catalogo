// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://meu-catalogo.vercel.app', // Placeholder - atualizar com dominio real no deploy
  vite: {
    plugins: [tailwindcss()],
  },
});