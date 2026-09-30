// Landing page content. Temporary: edit here while the landing design is iterated on.
export const owner = {
  name: 'Lily Sommer',
  tagline: 'Artist · Student · Researcher',
};

export interface LandingLink {
  label: string;
  href: string;
  description: string;
  /** Not ready yet: rendered as a placeholder instead of a live link. */
  stub?: boolean;
  external?: boolean;
}

export const links: LandingLink[] = [
  { label: 'Art Portfolio', href: '/portfolio', description: 'Paintings, collage, digital work and ceramics' },
  { label: 'Resume', href: '/resume', description: 'Coming soon', stub: true },
  { label: 'Research', href: '/research', description: 'Coming soon', stub: true },
  // TODO: replace with the real LinkedIn profile URL.
  { label: 'LinkedIn', href: '#', description: 'Profile link coming soon', stub: true, external: true },
  { label: 'GitHub', href: 'https://github.com/L-Sommer', description: 'Code and projects', external: true },
];
