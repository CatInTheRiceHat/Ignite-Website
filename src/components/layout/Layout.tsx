import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { defaultMetadata, pageMetadata } from '../../config/pageMetadata';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    const canonicalPath = pathname.replace(/\/+$/, '') || '/';
    const metadata = pageMetadata[canonicalPath] ?? defaultMetadata;
    const url = `https://ignitefindyourfire.org${canonicalPath}`;
    document.title = metadata.title;
    const values = {
      'meta[name="description"]': metadata.description,
      'meta[property="og:title"]': metadata.title,
      'meta[property="og:description"]': metadata.description,
      'meta[property="og:url"]': url,
    };
    Object.entries(values).forEach(([selector, value]) => {
      const element = document.querySelector<HTMLMetaElement>(selector);
      if (element) element.content = value;
    });
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = url;
  }, [pathname]);

  if (pathname.replace(/\/+$/, '') === '/sponsors') return <main>{children}</main>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[8.5rem] sm:pt-32 md:pt-36">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
