import { useEffect, useRef, type ReactNode } from 'react';

export default function ScrollReveal({ children }: { children: ReactNode }) {
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = container.querySelectorAll(
      'p, pre, blockquote, h2, h3, h4, ul, ol, .code-block-wrapper, img'
    );
    elements.forEach((el, i) => {
      el.classList.add('reveal-item');
      (el as HTMLElement).style.transitionDelay = `${i * 0.05}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef} className="scroll-reveal-container">{children}</div>;
}
