export interface Partner {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
}

// Add only confirmed partnerships, approved logos, and verified website links.
// Descriptions should distinguish work underway from proposed collaboration.
// Prospect lists and unused logo assets do not establish a partnership.
export const confirmedPartners: Partner[] = [
  {
    name: 'Doorstop Education',
    logo: '/partnerships/Doorstop.svg',
    website: 'https://doorstopeducation.org/',
  },
  {
    name: 'Sophie',
    logo: '/partnerships/Sophie.png',
    website: 'https://hello-sophie.com/',
  },
];
