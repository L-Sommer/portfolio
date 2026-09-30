// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://lilys-folio.vercel.app',
  trailingSlash: 'never',
  build: { format: 'directory' },
});
