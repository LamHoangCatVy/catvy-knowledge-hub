import { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

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

function parseMarkdown(content: string) {
  let html = content
    .replace(/^### (.+)$/gm, '<h4 style="color:var(--text-primary);font-size:16px;margin:24px 0 8px">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="color:var(--text-primary);font-size:20px;margin:32px 0 12px">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="color:var(--text-primary);font-size:24px;margin:36px 0 16px">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:#00f3ff">$1</a>')
    .replace(/^- (.+)$/gm, '<li style="color:var(--text-secondary);margin-bottom:6px">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="color:var(--text-secondary);margin-bottom:6px">$2</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:12px 0">$&</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return html;
}

function Lightbox({ images, currentIdx, onClose, onPrev, onNext }: {
  images: string[];
  currentIdx: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.9)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        style={{
          position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          fontSize: 24, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer',
        }}
      >
        ←
      </button>
      <img
        src={images[currentIdx]}
        alt={`Gallery ${currentIdx + 1}`}
        style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, cursor: 'default' }}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        style={{
          position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          fontSize: 24, width: 48, height: 48, borderRadius: '50%', cursor: 'pointer',
        }}
      >
        →
      </button>
      <span style={{ position: 'absolute', bottom: 24, color: '#888', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
        {currentIdx + 1} / {images.length}
      </span>
    </div>
  );
}

export default function ProjectDetailPage() {
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  const projectId = location.pathname.split('/').pop();

  useEffect(() => {
    fetch('/data/projects-showcase.json')
      .then((r) => r.json())
      .then((d: ProjectsData) => {
        setAllProjects(d.projects || []);
        const found = d.projects?.find((p) => p.id === projectId);
        setProject(found || null);
      })
      .catch(() => {});
  }, [projectId]);

  if (!project) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading project...
      </div>
    );
  }

  const color = CATEGORY_COLORS[project.category] || '#888';
  const demo = project.demo || { type: 'none' as const, iframeUrl: '', videoUrl: '', videoThumbnail: '', blogContent: '', gallery: [] };
  const hasDemo = demo.type !== 'none';

  const renderDemoContent = () => {
    switch (demo.type) {
      case 'iframe':
        return (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '10px 16px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28ca41' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>
                Live Demo
              </span>
              <a href={demo.iframeUrl} target="_blank" rel="noopener noreferrer"
                style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: 12, textDecoration: 'none' }}>
                ↗ Open
              </a>
            </div>
            <iframe
              src={demo.iframeUrl}
              style={{ flex: 1, border: 'none', width: '100%' }}
              title="Live Demo"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        );

      case 'video':
        return (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            <div style={{
              padding: '10px 16px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ color: '#ff0055', fontSize: 14 }}>▶</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)' }}>
                Project Walkthrough
              </span>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              {demo.videoUrl ? (
                <iframe
                  src={demo.videoUrl}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Project Video"
                />
              ) : (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: `url(${demo.videoThumbnail || ''}) center/cover`,
                  color: 'var(--text-muted)',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, color: '#ff0055', marginBottom: 12 }}>▶</div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                      Video coming soon
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'blog':
        return (
          <div style={{
            maxWidth: 720, margin: '48px auto 0', padding: '40px 0',
            borderTop: '1px solid var(--border-color)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32,
            }}>
              <span style={{ color: '#bc13fe', fontSize: 14 }}>📝</span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em',
              }}>
                Deep Dive Article
              </span>
              <span style={{
                marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: 'var(--text-muted)',
              }}>
                ~{Math.ceil(demo.blogContent.split(/\s+/).length / 200)} min read
              </span>
            </div>
            <div
              style={{
                fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.9,
              }}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(demo.blogContent) }}
            />
          </div>
        );

      case 'gallery':
        return (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
            }}>
              <span style={{ color: color, fontSize: 14 }}>🖼</span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                Project Gallery
              </span>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}>
              {demo.gallery.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxIdx(idx)}
                  style={{
                    cursor: 'pointer', borderRadius: 12, overflow: 'hidden',
                    border: '1px solid var(--border-color)', transition: 'all 0.3s',
                    aspectRatio: '16/10',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                  }}
                >
                  <img
                    src={img}
                    alt={`Screenshot ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
            {lightboxIdx !== null && (
              <Lightbox
                images={demo.gallery}
                currentIdx={lightboxIdx}
                onClose={() => setLightboxIdx(null)}
                onPrev={() => setLightboxIdx((lightboxIdx - 1 + demo.gallery.length) % demo.gallery.length)}
                onNext={() => setLightboxIdx((lightboxIdx + 1) % demo.gallery.length)}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: hasDemo && (demo.type === 'iframe' || demo.type === 'video') ? 1400 : 900,
      margin: '0 auto',
      padding: '100px 24px 60px',
      display: hasDemo && (demo.type === 'iframe' || demo.type === 'video') ? 'flex' : 'block',
      gap: 32,
    }}>
      <div style={{ flex: hasDemo && (demo.type === 'iframe' || demo.type === 'video') ? 1 : 'none', minWidth: 0 }}>
        {/* Back link + breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <a
            href="/projects"
            style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'color 0.2s',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7 3L4 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            All Projects
          </a>
          <span style={{ color: 'var(--border-hover)', fontSize: 10 }}>/</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--accent-primary)' }}>
            {project.title}
          </span>
        </div>

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
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '4px 12px', borderRadius: 20,
                border: `1px solid ${color}30`, color,
              }}
            >
              {project.category}
            </span>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '4px 12px', borderRadius: 20,
                border: `1px solid ${project.status === 'completed' ? '#00ff88' : '#ffaa00'}30`,
                color: project.status === 'completed' ? '#00ff88' : '#ffaa00',
                animation: project.status === 'in-progress' ? 'pulse-status 2s ease-in-out infinite' : 'none',
              }}
            >
              {project.status === 'completed' ? '✓ ' : '◎ '}{project.status}
            </span>
            {hasDemo && demo.type !== 'blog' && (
              <button
                onClick={() => setShowDemo(!showDemo)}
                style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '4px 14px', borderRadius: 20,
                  border: `1px solid ${color}40`, color,
                  background: showDemo ? `${color}15` : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                  marginLeft: 'auto',
                }}
              >
                {showDemo ? 'Hide Demo' : demo.type === 'video' ? '▶ Watch Video' : demo.type === 'gallery' ? '🖼 View Gallery' : '🌐 Show Demo'}
              </button>
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            {project.title}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{project.summary}</p>

          {project.hero.problem && (
            <div
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 32,
                padding: 24, background: 'var(--bg-card)', borderRadius: 12,
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#ff0055', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Problem
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{project.hero.problem}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#00ff88', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Outcome
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{project.hero.outcome}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tab navigation */}
        <div
          style={{
            display: 'flex', gap: 0, borderBottom: '1px solid var(--border-color)',
            marginBottom: 32, overflow: 'auto',
          }}
        >
          {project.sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '12px 20px',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: activeTab === idx ? color : 'var(--text-muted)',
                borderBottom: `2px solid ${activeTab === idx ? color : 'transparent'}`,
                background: 'transparent', cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
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
              fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.9, maxWidth: 720,
            }}
            dangerouslySetInnerHTML={{
              __html: project.sections[activeTab].content
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
                .replace(/\n\n/g, '<br/><br/>'),
            }}
          />
        )}

        {/* Gallery (when embedded in main content area) */}
        {hasDemo && demo.type === 'gallery' && showDemo && renderDemoContent()}

        {/* Blog content (always below, full-width) */}
        {hasDemo && demo.type === 'blog' && renderDemoContent()}

        {/* Tech stack */}
        <div style={{ marginTop: 48, padding: '24px 0', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Tech Stack
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {project.tech.map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                  padding: '6px 14px', borderRadius: 8,
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Repo link */}
        {project.repoUrl && (
          <div style={{ marginTop: 16, padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: 'var(--text-secondary)', textDecoration: 'none',
                padding: '8px 16px', borderRadius: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = color;
                (e.currentTarget as HTMLElement).style.color = color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              <i className="fab fa-github" />
              View Source Code
            </a>
          </div>
        )}

        {/* Share section */}
        <div style={{ marginTop: 32, padding: '24px 0', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Share this project
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '8px 16px',
                borderRadius: 20, border: '1px solid var(--border-color)',
                background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = color;
                (e.currentTarget as HTMLElement).style.color = color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              <i className="fas fa-link" /> Copy Link
            </button>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '8px 16px',
                borderRadius: 20, border: '1px solid var(--border-color)',
                background: 'var(--bg-card)', color: 'var(--text-secondary)', textDecoration: 'none',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '#0077B5'; el.style.color = '#0077B5';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border-color)'; el.style.color = 'var(--text-secondary)';
              }}
            >
              <i className="fab fa-linkedin-in" /> LinkedIn
            </a>
          </div>
        </div>

        {/* Related Projects */}
        {(() => {
          const related = allProjects
            .filter((p) => p.id !== project.id)
            .filter((p) => p.category === project.category || p.tech.some((t) => project.tech.includes(t)))
            .slice(0, 3);
          if (related.length === 0) return null;
          return (
            <div style={{ marginTop: 48, padding: '32px 0 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                Related Projects
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {related.map((rp) => {
                  const rpColor = CATEGORY_COLORS[rp.category] || '#888';
                  return (
                    <a
                      key={rp.id}
                      href={`/project/${rp.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        style={{
                          padding: 20, borderRadius: 14,
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          transition: 'all 0.3s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = rpColor;
                          (e.currentTarget as HTMLElement).style.background = `${rpColor}08`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                          (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: rpColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {rp.category}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                          {rp.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {rp.summary.slice(0, 80)}...
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Right panel: iframe/video demo */}
      {hasDemo && showDemo && (demo.type === 'iframe' || demo.type === 'video') && (
        <div style={{ flex: 1, minWidth: 400, position: 'sticky', top: 80, height: 'calc(100vh - 100px)' }}>
          {renderDemoContent()}
        </div>
      )}
    </div>
  );
}
