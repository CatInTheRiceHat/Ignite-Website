import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

// Load this through Vite alongside the pages so every Link shares this router's context.
export function renderPublicPage(Page: ComponentType, path: string) {
  return renderToStaticMarkup(createElement(StaticRouter, { location: path }, createElement(Page)));
}
