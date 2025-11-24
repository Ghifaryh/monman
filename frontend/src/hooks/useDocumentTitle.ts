import { useEffect } from 'react';

/**
 * Custom hook to dynamically set the document title
 * @param title - The title to set for the current page
 * @param fallback - Optional fallback title if main title is empty
 */
export const useDocumentTitle = (title?: string, fallback = 'MonMan') => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | MonMan`;
    } else {
      document.title = fallback;
    }

    // Cleanup: Reset to default title when component unmounts
    return () => {
      document.title = fallback;
    };
  }, [title, fallback]);
};

/**
 * Hook for pages that need simple title updates without the "| MonMan" suffix
 * @param title - The complete title to set
 */
export const useSimpleDocumentTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    // Restore previous title on cleanup
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};