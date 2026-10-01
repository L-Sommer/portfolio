// Landing page content: the name and the five navigation circles, in display order.
export const owner = {
  name: 'Lily Sommer',
  description: 'Lily Sommer: resume, biological research projects, GitHub and art portfolio.',
};

export type IconName = 'resume' | 'linkedin' | 'research' | 'github' | 'art';

export interface LandingLink {
  /** Shown under the circle; `\n` breaks the line. */
  label: string;
  icon: IconName;
  /** Omit while the destination doesn't exist yet: the circle renders as "coming soon". */
  href?: string;
  external?: boolean;
}

export const links: LandingLink[] = [
  { label: 'Resume', icon: 'resume', href: '/resume' },
  // TODO: add the LinkedIn profile URL (href + external: true).
  { label: 'LinkedIn', icon: 'linkedin' },
  { label: 'Biological\nResearch Projects', icon: 'research', href: '/research' },
  { label: 'GitHub', icon: 'github', href: 'https://github.com/L-Sommer', external: true },
  { label: 'Art Portfolio', icon: 'art', href: '/portfolio' },
];
