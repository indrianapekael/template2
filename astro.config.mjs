import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-haze.pages.dev',
  integrations: [],
  output: 'static',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      cssMinify: true
    }
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    format: ['avif', 'webp']
  },
  markdown: {
    // Sätteri is default in Astro 7, no config needed
    gfm: true
  },
  server: {
    port: 3000,
    host: true
  },
  devToolbar: {
    enabled: true
  }
});