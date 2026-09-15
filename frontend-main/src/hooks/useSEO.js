/**
 * Holy Grill — useSEO hook
 * ----------------------------------------------------------------------------
 * Dynamically updates document title + meta tags per page/route.
 * Every page MUST call this (or render <SEO />) — see BUILDER_RULES.md.
 *
 *   useSEO({ title: 'Menu', description: 'Browse the flame-grilled menu' });
 *
 * Falls back to APP_CONFIG.seo defaults when a field is omitted.
 */
import { useEffect } from 'react';
import APP_CONFIG from '@/config/app.config';

const upsertMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertCanonical = (url) => {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

export const useSEO = ({ title, description, image, path, type } = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${APP_CONFIG.name}` : APP_CONFIG.seo.defaultTitle;
    const desc = description || APP_CONFIG.seo.defaultDescription;
    const img = image || APP_CONFIG.seo.defaultImage;
    const url = `${APP_CONFIG.domain}${path || window.location.pathname}`;
    const ogType = type || APP_CONFIG.seo.ogType;

    document.title = fullTitle;

    upsertMeta('name', 'description', desc);
    upsertMeta('name', 'theme-color', APP_CONFIG.themeColor);

    // Open Graph
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:site_name', APP_CONFIG.name);
    if (img) upsertMeta('property', 'og:image', img);

    // Twitter
    upsertMeta('name', 'twitter:card', APP_CONFIG.seo.twitterCard);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    if (img) upsertMeta('name', 'twitter:image', img);

    upsertCanonical(url);
  }, [title, description, image, path, type]);
};

export default useSEO;