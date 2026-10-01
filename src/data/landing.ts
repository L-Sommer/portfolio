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
  href?: string;
  external?: boolean;
  /** Not ready yet: shows "Coming soon" on hover and doesn't navigate (also implied by no href). */
  soon?: boolean;
}

export const links: LandingLink[] = [
  // Remove `soon` to switch a circle on once its page is ready.
  { label: 'Resume', icon: 'resume', href: '/resume', soon: true },
  // TODO: add the LinkedIn profile URL (href + external: true).
  { label: 'LinkedIn', icon: 'linkedin' },
  { label: 'Biology\nResearch Projects', icon: 'research', href: '/research', soon: true },
  { label: 'GitHub', icon: 'github', href: 'https://github.com/L-Sommer', external: true },
  { label: 'Art Portfolio', icon: 'art', href: '/portfolio' },
];
