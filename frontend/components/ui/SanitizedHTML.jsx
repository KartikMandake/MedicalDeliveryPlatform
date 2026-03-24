import React, { useMemo } from 'react';

/**
 * A native zero-dependency HTML sanitizer component.
 * Parses input HTML string, removes common XSS vectors (<script>, <iframe...>), 
 * strips inline 'on*' event handlers, and safely renders the content.
 */
export default function SanitizedHTML({ html, className = '' }) {
  const safeHTML = useMemo(() => {
    if (!html) return { __html: '' };
    
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      // 1. Remove dangerous tags
      const dangerousTags = 'script, iframe, object, embed, style, link, applet, meta, base';
      const elementsToRemove = doc.querySelectorAll(dangerousTags);
      elementsToRemove.forEach(el => el.remove());
      
      // 2. Clear inherently dangerous attributes
      const allElements = doc.querySelectorAll('*');
      allElements.forEach(el => {
        const attributes = Array.from(el.attributes);
        for (let attr of attributes) {
          const attrName = attr.name.toLowerCase();
          const attrVal = attr.value.toLowerCase();
          
          if (
            attrName.startsWith('on') || 
            (attrName === 'href' && attrVal.startsWith('javascript:')) ||
            (attrName === 'src' && attrVal.startsWith('javascript:')) ||
            (attrName === 'src' && attrVal.startsWith('data:text/html'))
          ) {
            el.removeAttribute(attr.name);
          }
        }
      });
      
      return { __html: doc.body.innerHTML };
    } catch (e) {
      console.warn("HTML Sanitization failed", e);
      return { __html: '' }; // Secure escape hatch
    }
  }, [html]);

  return <div className={className} dangerouslySetInnerHTML={safeHTML} />;
}
