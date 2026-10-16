// Student enrollment and a replacement application URL are not yet confirmed.
export const LEARNING_HUB_URL = 'https://learn.ignitefindyourfire.org';
export const INTERN_FORM_URL = import.meta.env.VITE_INTERN_FORM_URL ?? 'https://forms.gle/wV8e5edRNVNpUJvt7';
// Use the supplied direct link: Google's embedded version requires cookie/sign-in access.
export const PARTNERSHIP_FORM_URL = import.meta.env.VITE_PARTNERSHIP_FORM_URL?.trim()
  ?? 'https://forms.gle/6Zte2NF4fbWj2Y7W9';

export function getGoogleFormLinks(value: string): { url: string; embedUrl: string | null } | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;

    // Short links can be opened directly, but cannot reliably be embedded.
    if (url.hostname === 'forms.gle' && /^\/[\w-]+\/?$/.test(url.pathname)) {
      return { url: url.href, embedUrl: null };
    }
    if (url.hostname !== 'docs.google.com' || !/^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[\w-]+\/viewform\/?$/.test(url.pathname)) return null;

    url.searchParams.delete('embedded');
    const embed = new URL(url.href);
    embed.searchParams.set('embedded', 'true');
    return { url: url.href, embedUrl: embed.href };
  } catch {
    return null;
  }
}
