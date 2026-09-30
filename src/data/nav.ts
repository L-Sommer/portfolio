// Portfolio navigation, mirroring the Wix site menu (Advanced has a dropdown of project pages).
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const portfolioNav: NavItem[] = [
  { label: 'About Me', href: '/portfolio/about' },
  { label: 'Past Works', href: '/portfolio/past-works' },
  {
    label: 'Advanced',
    href: '/portfolio/advanced',
    children: [
      { label: 'Green', href: '/portfolio/green' },
      { label: 'We Are Shaped', href: '/portfolio/we-are-shaped' },
      { label: 'View of A Classroom', href: '/portfolio/view-of-a-classroom' },
    ],
  },
];
