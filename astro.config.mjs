import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import siteConfig from './src/site.config.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',

  adapter: vercel(),

  integrations: [mdx(), ...(siteConfig.features.sitemap ? [sitemap()] : [])],

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

  server: {
    port: 3000,
    host: true
  },

  devToolbar: {
    enabled: true
  }
});