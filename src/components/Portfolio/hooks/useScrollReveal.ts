import { useEffect, useRef } from 'react';

export function useScrollReveal(selector = '.reveal-item', threshold = 0.15) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );

    const timer = setTimeout(() => {
      container.querySelectorAll(selector).forEach((el, i) => {
        el.classList.add('reveal-item');
        (el as HTMLElement).style.setProperty('--reveal-index', String(i));
        observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [selector, threshold]);

  return containerRef;
}
