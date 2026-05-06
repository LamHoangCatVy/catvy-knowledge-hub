import React, { type ReactNode, useEffect } from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import type BlogPostPageType from '@theme/BlogPostPage';
import type { WrapperProps } from '@docusaurus/types';
import '@site/src/css/blog-theme.css';

type Props = WrapperProps<typeof BlogPostPageType>;

function ReadingProgress() {
  const [w, setW] = React.useState(0);
  useEffect(() => {
    const on = () => {
      const s = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setW(h > 0 ? Math.min((s / h) * 100, 100) : 0);
    };
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => window.removeEventListener('scroll', on);
  }, []);
  return <div className="rp-bar"><div className="rp-fill" style={{ width: `${w}%` }} /></div>;
}

function ScrollToTop() {
  const [v, setV] = React.useState(false);
  useEffect(() => {
    const on = () => setV(window.scrollY > 400);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <button
      className={`scroll-top-btn ${v ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function FloatingTOC() {
  const [items, setItems] = React.useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = React.useState('');
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const hs = document.querySelectorAll<HTMLHeadingElement>('article h2, article h3');
      const toc: { id: string; text: string; level: number }[] = [];
      hs.forEach((h) => {
        if (!h.id) h.id = (h.textContent || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        toc.push({ id: h.id, text: h.textContent || '', level: h.tagName === 'H2' ? 2 : 3 });
      });
      setItems(toc);
      if (!toc.length) return;
      const obs = new IntersectionObserver(
        (es) => es.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); }),
        { rootMargin: '-80px 0px -80% 0px', threshold: 0 }
      );
      hs.forEach((h) => obs.observe(h));
      return () => obs.disconnect();
    }, 600);
    return () => clearTimeout(t);
  }, []);

  if (!items.length) return null;

  return (
    <div className={`floating-toc ${open ? 'toc-open' : ''}`}>
      <button className="toc-toggle" onClick={() => setOpen(!open)} aria-label="Table of contents">
        <span className="toc-toggle-label">On this page</span>
        <svg className={`toc-chevron ${open ? 'rotate-180' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <nav className={`toc-list ${open ? 'block' : 'hidden'}`}>
        {items.map((i) => (
          <a key={i.id} href={`#${i.id}`} className={`toc-link toc-level-${i.level} ${activeId === i.id ? 'toc-active' : ''}`}
            onClick={(e) => { e.preventDefault(); document.getElementById(i.id)?.scrollIntoView({ behavior: 'smooth' }); }}>
            {i.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

function ScrollRevealEffect() {
  useEffect(() => {
    const t = setTimeout(() => {
      const article = document.querySelector('article');
      if (!article) return;
      const els = article.querySelectorAll('p, pre, blockquote, h2, h3, h4, ul, ol, img');
      els.forEach((el, i) => {
        (el as HTMLElement).classList.add('reveal-item');
        (el as HTMLElement).style.transitionDelay = `${i * 0.05}s`;
      });
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } }),
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 400);
    return () => clearTimeout(t);
  }, []);
  return null;
}

function ReadingRing() {
  const [progress, setProgress] = React.useState(0);
  useEffect(() => {
    const on = () => {
      const s = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min((s / h) * 100, 100) : 0);
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <div className="reading-ring">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="2"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 22 22)"
          style={{ transition: 'stroke-dashoffset 0.15s linear' }} />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="100%" stopColor="#bc13fe" />
          </linearGradient>
        </defs>
      </svg>
      <span className="reading-ring-text">{Math.round(progress)}%</span>
    </div>
  );
}

function BlogHeroImage() {
  const [img, setImg] = React.useState('');
  useEffect(() => {
    const metaImg = document.querySelector('meta[property="og:image"]');
    if (!metaImg) return;
    const src = metaImg.getAttribute('content') || '';
    if (src && !src.includes('docusaurus-social-card') && !src.includes('undraw')) {
      setImg(src);
    }
  }, []);
  if (!img) return null;
  return (
    <div className="blog-hero-image">
      <img src={img} alt="" className="blog-hero-img" />
    </div>
  );
}

function AuthorSection() {
  const [meta, setMeta] = React.useState<{ title: string; date: string; readingTime?: number; tags?: { label: string; permalink: string }[] } | null>(null);

  useEffect(() => {
    const title = document.querySelector('article h1')?.textContent || '';
    const dateEl = document.querySelector('article time');
    const date = dateEl?.getAttribute('datetime') || '';
    const text = document.querySelector('article')?.textContent || '';
    const words = text.split(/\s+/).length;
    const tagEls = document.querySelectorAll('article header .tag_node_modules-\\@docusaurus-theme-classic-lib-theme-Tag-');
    const tags: { label: string; permalink: string }[] = [];
    tagEls.forEach((el) => {
      const a = el.querySelector('a');
      if (a) tags.push({ label: a.textContent || '', permalink: a.getAttribute('href') || '' });
    });
    setMeta({ title, date, readingTime: Math.ceil(words / 200), tags });
  }, []);

  if (!meta) return null;
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const shareT = `${meta.title} — Lam Hoang Cat Vy`;

  return (
    <div className="author-card">
      <div className="author-card-inner">
        <div className="author-avatar-section">
          <img src="https://github.com/LamHoangCatVy.png" alt="Cat Vy" className="author-avatar" loading="lazy" />
          <div>
            <h4 className="author-name">Lam Hoang Cat Vy</h4>
            <p className="author-title">Senior AI Systems Architect</p>
          </div>
        </div>
        <div className="author-stats">
          {meta.readingTime && <span className="author-stat">{Math.ceil(meta.readingTime)} min read</span>}
        </div>
      </div>
      <div className="author-share-row">
        <span className="share-label">Share</span>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareT)}`} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="X">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M10.5 1.5h2.07L8.57 6.1l4.72 6.4H9.3l-3.27-4.27L2.3 12.5H.23l4.85-5.54L.5 1.5h4.14l2.96 3.9 2.9-3.9zM9.82 11.38h1.15L3.95 2.56H2.7l7.12 8.82z" /></svg>
        </a>
        <button onClick={() => { navigator.clipboard.writeText(url); }} className="share-btn" aria-label="Copy link">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="5" y="5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" /><path d="M3 9V3a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>
      {meta.tags && meta.tags.length > 0 && (
        <div className="author-tags">{meta.tags.map((t) => <a key={t.permalink} href={t.permalink} className="author-tag">{t.label}</a>)}</div>
      )}
    </div>
  );
}

export default function BlogPostPageWrapper(props: Props): ReactNode {
  return (
    <div className="blog-post-enter">
      <ReadingProgress />
      <ReadingRing />
      <FloatingTOC />
      <ScrollRevealEffect />
      <BlogHeroImage />
      <BlogPostPage {...props} />
      <AuthorSection />
      <ScrollToTop />
    </div>
  );
}
