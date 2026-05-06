import { useEffect, useState, useRef } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function FloatingTOC() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLHeadingElement>(
      'article h2, article h3'
    );
    const toc: TocItem[] = [];
    headings.forEach((h) => {
      if (!h.id) h.id = h.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      toc.push({ id: h.id, text: h.textContent || '', level: h.tagName === 'H2' ? 2 : 3 });
    });
    setItems(toc);

    if (toc.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px', threshold: 0 }
    );

    headings.forEach((h) => observerRef.current?.observe(h));

    return () => observerRef.current?.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={`floating-toc ${isOpen ? 'toc-open' : ''}`}>
      <button
        className="toc-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Table of contents"
      >
        <span className="toc-toggle-label">On this page</span>
        <svg
          className={`toc-chevron ${isOpen ? 'rotate-180' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <nav className={`toc-list ${isOpen ? 'block' : 'hidden'}`}>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`toc-link toc-level-${item.level} ${activeId === item.id ? 'toc-active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              setActiveId(item.id);
            }}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
