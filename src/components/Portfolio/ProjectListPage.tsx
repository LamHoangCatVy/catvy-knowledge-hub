import { useState, useEffect } from 'react';

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
  links: { demo: string; repo: string };
}

interface ProjectsData {
  projects: Project[];
}

const CATEGORY_COLORS: Record<string, string> = {
  GenAI: '#00f3ff',
  Cloud: '#00ff88',
  Security: '#ff0055',
  Leadership: '#ffaa00',
};

function ProjectCard({ project }: { project: Project }) {
  const color = CATEGORY_COLORS[project.category] || '#888';

  return (
    <a
      href={`/project/${project.id}`}
      className="!no-underline"
      style={{ display: 'block' }}
    >
      <div
        className="project-tilt-card"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <span
          className="project-card-tag"
          style={{ borderColor: color, color }}
        >
          {project.category}
        </span>
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

  useEffect(() => {
    fetch('/data/projects-showcase.json')
      .then((r) => r.json())
      .then((d: ProjectsData) => setProjects(d.projects || []))
      .catch(() => {});
  }, []);

  const categories = ['all', ...new Set(projects.map((p) => p.category))];
  const filtered = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            color: '#00f3ff',
            marginBottom: 12,
          }}
        >
          Showcase
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 800,
            color: '#fff',
            margin: 0,
          }}
        >
          Project Portfolio
        </h1>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 40,
          flexWrap: 'wrap',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '8px 18px',
              borderRadius: 20,
              border: `1px solid ${filter === cat ? (CATEGORY_COLORS[cat] || '#00f3ff') : 'rgba(255,255,255,0.1)'}`,
              background: filter === cat ? 'rgba(0, 243, 255, 0.08)' : 'transparent',
              color: filter === cat ? CATEGORY_COLORS[cat] || '#00f3ff' : '#888',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#555', padding: 60 }}>
          Loading projects...
        </div>
      ) : (
        <div className="project-grid">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
