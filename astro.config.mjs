import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import siteConfig from './src/site.config.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-haze.pages.dev',
  // Sitemap generation is gated by the `features.sitemap` flag in site.config.
  integrations: siteConfig.features.sitemap ? [sitemap()] : [],
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
  // Markdown is handled by Sätteri (Astro 7 default). GFM — tables, task
  // lists, footnotes — is enabled out of the box, so no config is needed.
  server: {
    port: 3000,
    host: true
  },
  devToolbar: {
    enabled: true
  }
});