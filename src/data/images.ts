// Original-resolution artwork, keyed by file name without extension (see tools/media-map.json).
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/portfolio/*.{png,jpg}', { eager: true });

const byName = new Map(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!.replace(/\.\w+$/, ''), mod.default]),
);

export function imageFor(name: string): ImageMetadata {
  const img = byName.get(name);
  if (!img) throw new Error(`Missing portfolio image: ${name}`);
  return img;
}
