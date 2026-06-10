import { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';

interface DemoSection {
  type: 'none' | 'iframe' | 'video' | 'blog' | 'gallery';
  iframeUrl: string;
  videoUrl: string;
  videoThumbnail: string;
  blogContent: string;
  gallery: string[];
}

interface Project {
  id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  status: string;
  featured: boolean;
  summary: string;
  hero: { problem: string; outcome: string };
  sections: { title: string; icon: string; content: string }[];
  tech: string[];
  demo: DemoSection;
  repoUrl: string;
}

interface ProjectsData {
  projects: Project[];
}

const CATEGORY_COLORS: Record<string, string> = {
  GenAI: '#00f3ff',
  Cloud: '#00ff88',
  Security: '#ff0055',
  Leadership: '#ffaa00',
  'Full-Stack': '#bc13fe',
};

const DEMO_META: Record<string, { icon: string; color: string }> = {
  iframe: { icon: '🌐', color: '#00f3ff' },
  video: { icon: '▶', color: '#ff0055' },
  blog: { icon: '📄', color: '#bc13fe' },
  gallery: { icon: '🖼', color: '#ffaa00' },
};

function ProjectCard({ project }: { project: Project }) {
  const color = CATEGORY_COLORS[project.category] || '#888';
  const demo = project.demo;
  const demoMeta = demo && demo.type !== 'none' ? DEMO_META[demo.type] : null;

  return (
    <a
      href={`/project/${project.id}`}
      className="!no-underline"
      style={{ display: 'block' }}
    >
      <div
        className="project-tilt-card"
        style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        {/* Status & Demo badges in card header */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span
            className="project-card-tag"
            style={{ borderColor: color, color }}
          >
            {project.category}
          </span>
          {demoMeta && (
            <span
              className="project-card-tag"
              style={{
                borderColor: demoMeta.color,
                color: demoMeta.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 8,
              }}
              title={`${demo.type} available`}
            >
              {demoMeta.icon} {demo.type}
            </span>
          )}
        </div>
        <h4 className="project-card-title">{project.title}</h4>
        <p className="project-card-desc" style={{ flex: 1 }}>{project.summary}</p>
        <div className="project-card-tech">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date-desc');

  useEffect(() => {
    fetch('/data/projects-showcase.json')
      .then((r) => r.json())
      .then((d: ProjectsData) => setProjects(d.projects || []))
      .catch(() => {});
  }, []);

  const categories = ['all', ...new Set(projects.map((p) => p.category))];

  const filtered = useMemo(() => {
    let result = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tech.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'date-desc': return b.date.localeCompare(a.date);
        case 'date-asc': return a.date.localeCompare(b.date);
        case 'name': return a.title.localeCompare(b.title);
        case 'category': return a.category.localeCompare(b.category);
        default: return 0;
      }
    });

    return result;
  }, [projects, filter, search, sort]);

  return (
    <Layout>
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '0.25em',
            color: 'var(--accent-primary)', marginBottom: 12,
          }}
        >
          Showcase
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800,
            color: 'var(--text-primary)', margin: 0,
          }}
        >
          Project Portfolio
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 12 }}>
          {projects.length} projects &middot; {categories.length - 1} categories
        </p>
      </div>

      {/* Search & Sort */}
      <div
        style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 12, marginBottom: 24, flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative' }}>
          <i
            className="fas fa-search"
            style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', fontSize: 12, pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
              padding: '10px 16px 10px 36px', borderRadius: 24,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              outline: 'none', width: 240,
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-primary)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-color)'; }}
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            padding: '10px 14px', borderRadius: 24,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)', color: 'var(--text-secondary)',
            cursor: 'pointer', outline: 'none',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name">By Name</option>
          <option value="category">By Category</option>
        </select>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40, flexWrap: 'wrap',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '8px 18px', borderRadius: 20,
              border: `1px solid ${filter === cat ? (CATEGORY_COLORS[cat] || 'var(--accent-primary)') : 'var(--border-color)'}`,
              background: filter === cat ? `${CATEGORY_COLORS[cat] || '#00f3ff'}10` : 'var(--bg-card)',
              color: filter === cat ? (CATEGORY_COLORS[cat] || 'var(--accent-primary)') : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        {Object.entries(DEMO_META).map(([key, meta]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <span style={{ color: meta.color }}>{meta.icon}</span> {key}
          </div>
        ))}
      </div>

      {/* Results */}
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>
          Loading projects...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>
          No projects match your search.
        </div>
      ) : (
        <div className="project-grid">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {/* Back to top */}
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: 'var(--text-muted)', background: 'var(--bg-card)',
            border: '1px solid var(--border-color)', borderRadius: 20,
            padding: '10px 24px', cursor: 'pointer',
            transition: 'all 0.2s', display: 'inline-flex',
            alignItems: 'center', gap: 8,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 8L5 2M5 2L2 5M5 2L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Back to Top
        </button>
      </div>
    </div>
    </Layout>
  );
}
