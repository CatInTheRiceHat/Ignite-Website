import { createRoot } from 'react-dom/client';
import { safeHttpUrl, DEFAULT_WEBSITE_URL } from '../shared/destinations';
import { SolWidget, type WidgetConfig, type WidgetControls } from './SolWidget';
import styles from './styles.css?inline';

const instances = new WeakMap<HTMLElement, WidgetControls>();

export function mount(options: Partial<WidgetConfig> = {}, container: HTMLElement = document.body): WidgetControls {
  const existing = instances.get(container);
  if (existing) return existing;
  const backendUrl = options.backendUrl ? safeHttpUrl(options.backendUrl).replace(/\/$/, '') : window.location.origin;
  const assetUrl = (value: string | undefined, fallback: string) => safeHttpUrl(new URL(value || fallback, window.location.href).href);
  const config: WidgetConfig = {
    backendUrl,
    websiteBaseUrl: safeHttpUrl(options.websiteBaseUrl || DEFAULT_WEBSITE_URL),
    mascotUrl: safeHttpUrl(new URL(options.mascotUrl || '/mascots/Mascot.png', window.location.href).href),
    // Artwork follows the backend origin; the integrated website uses its own origin.
    launcherMascotUrl: assetUrl(options.launcherMascotUrl, `${backendUrl}/mascots/Idle.gif`),
    headerMascotUrl: assetUrl(options.headerMascotUrl, `${backendUrl}/mascots/Logo.png`),
    loadFonts: options.loadFonts !== false,
  };
  if (config.loadFonts && !document.querySelector('[data-sol-fonts], link[href*="family=Nunito"]')) {
    // Font definitions only: no host element selectors or theme overrides.
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet'; fonts.dataset.solFonts = '';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Poppins:wght@500;600;700&display=swap';
    document.head.append(fonts);
  }
  const host = document.createElement('sol-widget');
  host.style.cssText = 'all:initial;position:static;display:block;';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style'); style.textContent = styles;
  const rootElement = document.createElement('div');
  shadow.append(style, rootElement); container.append(host);
  const root = createRoot(rootElement);
  root.render(<SolWidget host={host} config={config} />);
  const controls: WidgetControls = {
    open: () => { host.dispatchEvent(new Event('sol:open')); },
    close: () => { host.dispatchEvent(new Event('sol:close')); },
    destroy: () => { root.unmount(); host.remove(); instances.delete(container); },
  };
  instances.set(container, controls);
  return controls;
}
