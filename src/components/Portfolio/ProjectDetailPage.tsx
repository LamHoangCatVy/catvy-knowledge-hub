import { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

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

export default function ProjectDetailPage() {
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const projectId = location.pathname.split('/').pop();

  useEffect(() => {
    fetch('/data/projects-showcase.json')
      .then((r) => r.json())
      .then((d: ProjectsData) => {
        const found = d.projects?.find((p) => p.id === projectId);
        setProject(found || null);
      })
      .catch(() => {});
  }, [projectId]);

  if (!project) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px', textAlign: 'center', color: '#555' }}>
        Loading project...
      </div>
    );
  }

  const color = CATEGORY_COLORS[project.category] || '#888';
  const hasDemo = project.links?.demo && project.links.demo.length > 0;

  return (
    <div style={{ maxWidth: hasDemo ? 1400 : 900, margin: '0 auto', padding: '100px 24px 60px', display: hasDemo ? 'flex' : 'block', gap: 32 }}>
      {/* Left panel: project content */}
      <div style={{ flex: hasDemo ? 1 : 'none', minWidth: 0 }}>
      <a
        href="/projects"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: '#888',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 32,
          transition: 'color 0.2s',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M7 3L4 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        All Projects
      </a>

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${color}10, ${color}05)`,
          border: `1px solid ${color}20`,
          borderRadius: 24,
          padding: '48px 36px',
          marginBottom: 40,
        }}
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '4px 12px',
              borderRadius: 20,
              border: `1px solid ${color}30`,
              color,
            }}
          >
            {project.category}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '4px 12px',
              borderRadius: 20,
              border: `1px solid ${project.status === 'completed' ? '#00ff88' : '#ffaa00'}30`,
              color: project.status === 'completed' ? '#00ff88' : '#ffaa00',
            }}
          >
            {project.status}
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
          {project.title}
        </h1>
        <p style={{ fontSize: 16, color: '#999', lineHeight: 1.6 }}>{project.summary}</p>

        {project.hero.problem && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              marginTop: 32,
              padding: 24,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#ff0055', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Problem
              </div>
              <div style={{ fontSize: 14, color: '#ccc' }}>{project.hero.problem}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#00ff88', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Outcome
              </div>
              <div style={{ fontSize: 14, color: '#ccc' }}>{project.hero.outcome}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 32,
          overflow: 'auto',
        }}
      >
        {project.sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '12px 20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: activeTab === idx ? color : '#666',
              borderBottom: `2px solid ${activeTab === idx ? color : 'transparent'}`,
              background: 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <i className={section.icon} style={{ fontSize: 12 }} />
            {section.title}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {project.sections[activeTab] && (
        <div
          style={{
            fontSize: 15,
            color: '#bbb',
            lineHeight: 1.9,
            maxWidth: 720,
          }}
          dangerouslySetInnerHTML={{
            __html: project.sections[activeTab].content
              .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>')
              .replace(/\n\n/g, '<br/><br/>'),
          }}
        />
      )}

      {/* Tech stack */}
      <div style={{ marginTop: 48, padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Tech Stack
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {project.tech.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                padding: '6px 14px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#aaa',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      {/* Close left panel */}
      </div>

      {/* Right panel: live demo iframe */}
      {hasDemo && (
        <div style={{ flex: 1, minWidth: 400, position: 'sticky', top: 80, height: 'calc(100vh - 100px)' }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28ca41' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666', marginLeft: 8 }}>
                Live Demo
              </span>
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer"
                style={{ marginLeft: 'auto', color: '#888', fontSize: 12, textDecoration: 'none' }}>
                ↗ Open
              </a>
            </div>
            <iframe
              src={project.links.demo}
              style={{ flex: 1, border: 'none', width: '100%' }}
              title="Live Demo"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
