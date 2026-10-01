/// <reference types="bun" />
// Minimal static server for dist/ with clean URLs (like Vercel), for browser tests.
import { statSync } from 'node:fs';
import { join } from 'node:path';

export const DIST = join(import.meta.dir, '..', '..', 'dist');

export function serveDist() {
  const isFile = (f: string) => statSync(f, { throwIfNoEntry: false })?.isFile() ?? false;
  return Bun.serve({
    port: 0,
    fetch(req) {
      const path = decodeURIComponent(new URL(req.url).pathname);
      const file = [join(DIST, path), join(DIST, path, 'index.html')].find(isFile);
      return file ? new Response(Bun.file(file)) : new Response('Not found', { status: 404 });
    },
  });
}
