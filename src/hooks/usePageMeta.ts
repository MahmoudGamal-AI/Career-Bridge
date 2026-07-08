import { useEffect } from 'react';

const DEFAULT_TITLE = 'Career Bridge';

/**
 * Sets the document title and meta description for a page (SEO).
 * Restores the default title on unmount.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description]);
}
