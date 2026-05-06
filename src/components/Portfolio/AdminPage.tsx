import { useState, useEffect } from 'react';

interface ProjectSection {
  title: string;
  icon: string;
  content: string;
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
  sections: ProjectSection[];
  tech: string[];
  links: { demo: string; repo: string };
}

interface ProjectsData {
  projects: Project[];
}

const NARRATIVE_TYPES: Record<string, { label: string; sections: ProjectSection[] }> = {
  'problem-solving': {
    label: 'Problem Solving',
    sections: [
      { title: 'The Business Problem', icon: 'fas fa-briefcase', content: '' },
      { title: 'Research & Discovery', icon: 'fas fa-search', content: '' },
      { title: 'Technical Architecture', icon: 'fas fa-sitemap', content: '' },
      { title: 'Implementation Journey', icon: 'fas fa-code', content: '' },
      { title: 'Results & Impact', icon: 'fas fa-chart-line', content: '' },
    ],
  },
  migration: {
    label: 'Migration',
    sections: [
      { title: 'Why Migrate', icon: 'fas fa-question-circle', content: '' },
      { title: 'Architecture Design', icon: 'fas fa-sitemap', content: '' },
      { title: 'Execution Plan', icon: 'fas fa-tasks', content: '' },
      { title: 'Lessons Learned', icon: 'fas fa-lightbulb', content: '' },
    ],
  },
  research: {
    label: 'Research',
    sections: [
      { title: 'Research Question', icon: 'fas fa-flask', content: '' },
      { title: 'Background', icon: 'fas fa-book', content: '' },
      { title: 'Methodology', icon: 'fas fa-cogs', content: '' },
      { title: 'Experiments', icon: 'fas fa-vial', content: '' },
      { title: 'Findings', icon: 'fas fa-lightbulb', content: '' },
    ],
  },
  'product-build': {
    label: 'Product Build',
    sections: [
      { title: 'User Problem', icon: 'fas fa-users', content: '' },
      { title: 'Requirements', icon: 'fas fa-list-check', content: '' },
      { title: 'System Design', icon: 'fas fa-sitemap', content: '' },
      { title: 'Development', icon: 'fas fa-code', content: '' },
      { title: 'Launch & Results', icon: 'fas fa-rocket', content: '' },
    ],
  },
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [jsonOutput, setJsonOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const ADMIN_PASSWORD = 'catvy2024';

  useEffect(() => {
    fetch('/data/projects-showcase.json')
      .then((r) => r.json())
      .then((d: ProjectsData) => setProjects(d.projects || []))
      .catch(() => {});
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
    else alert('Wrong password');
  };

  const createNew = () => {
    const t = 'problem-solving' as const;
    setEditing({
      id: '', title: '', type: t, category: '', date: new Date().toISOString().slice(0, 7),
      status: 'in-progress', featured: false, summary: '',
      hero: { problem: '', outcome: '' },
      sections: NARRATIVE_TYPES[t].sections.map((s) => ({ ...s })),
      tech: [], links: { demo: '', repo: '' },
    });
  };

  const saveProject = () => {
    if (!editing) return;
    const updated = projects.filter((p) => p.id !== editing.id);
    updated.push(editing);
    const output: ProjectsData = { projects: updated };
    const json = JSON.stringify(output, null, 2);
    setJsonOutput(json);
    setProjects(updated);
    setEditing(null);
  };

  const deleteProject = (id: string) => {
    if (!confirm('Delete this project?')) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authenticated) {
    return (
      <div style={{ maxWidth: 400, margin: '150px auto', padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: '#fff', marginBottom: 20 }}>Admin Access</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="Password"
          style={{
            width: '100%', padding: 12, borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
            color: '#fff', fontSize: 14, marginBottom: 16, outline: 'none',
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            padding: '10px 32px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #00f3ff, #bc13fe)',
            color: '#fff', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Enter
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>Project CMS</h1>
        <button onClick={createNew} style={{
          padding: '10px 24px', borderRadius: 8, border: '1px solid #00ff88',
          background: 'rgba(0,255,136,0.1)', color: '#00ff88', fontWeight: 700, cursor: 'pointer',
        }}>
          + New Project
        </button>
      </div>

      {/* Project list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {projects.map((p) => (
          <div key={p.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
          }}>
            <div>
              <span style={{ color: '#fff', fontWeight: 700 }}>{p.title}</span>
              <span style={{ color: '#666', fontSize: 12, marginLeft: 12, fontFamily: 'monospace' }}>{p.id}</span>
              <span style={{ color: '#888', fontSize: 12, marginLeft: 12 }}>{p.category} · {p.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing({ ...p })} style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(0,243,255,0.3)',
                background: 'rgba(0,243,255,0.08)', color: '#00f3ff', cursor: 'pointer', fontSize: 12,
              }}>
                Edit
              </button>
              <button onClick={() => deleteProject(p.id)} style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,0,85,0.3)',
                background: 'rgba(255,0,85,0.08)', color: '#ff0055', cursor: 'pointer', fontSize: 12,
              }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,243,255,0.2)',
          borderRadius: 16, padding: 32, marginBottom: 40,
        }}>
          <h2 style={{ color: '#fff', marginBottom: 24 }}>
            {editing.id ? `Edit: ${editing.title}` : 'New Project'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <InputField label="ID (slug)" value={editing.id} onChange={(v) => setEditing({ ...editing, id: v })} />
            <InputField label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
            <InputField label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} />
            <SelectField label="Type" value={editing.type} options={Object.keys(NARRATIVE_TYPES)} labels={Object.entries(NARRATIVE_TYPES).map(([k, v]) => [k, v.label])}
              onChange={(v) => {
                const t = v as keyof typeof NARRATIVE_TYPES;
                const template = NARRATIVE_TYPES[t];
                setEditing({ ...editing, type: t, sections: template ? template.sections.map((s) => ({ ...s })) : editing.sections });
              }}
            />
            <InputField label="Date (YYYY-MM)" value={editing.date} onChange={(v) => setEditing({ ...editing, date: v })} />
            <SelectField label="Status" value={editing.status} options={['completed', 'in-progress', 'planned']} labels={[]}
              onChange={(v) => setEditing({ ...editing, status: v })}
            />
            <InputField label="Hero Problem" value={editing.hero.problem} onChange={(v) => setEditing({ ...editing, hero: { ...editing.hero, problem: v } })} />
            <InputField label="Hero Outcome" value={editing.hero.outcome} onChange={(v) => setEditing({ ...editing, hero: { ...editing.hero, outcome: v } })} />
            <InputField label="Demo URL" value={editing.links.demo} onChange={(v) => setEditing({ ...editing, links: { ...editing.links, demo: v } })} />
            <InputField label="Repo URL" value={editing.links.repo} onChange={(v) => setEditing({ ...editing, links: { ...editing.links, repo: v } })} />
          </div>
          <InputField label="Summary" value={editing.summary} onChange={(v) => setEditing({ ...editing, summary: v })} />
          <InputField label="Tech (comma-separated)" value={editing.tech.join(', ')} onChange={(v) => setEditing({ ...editing, tech: v.split(',').map((s) => s.trim()).filter(Boolean) })} />

          <div style={{ marginTop: 24 }}>
            <h3 style={{ color: '#fff', marginBottom: 12 }}>Sections</h3>
            {editing.sections.map((sec, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                  <input
                    value={sec.title}
                    onChange={(e) => {
                      const ns = [...editing.sections];
                      ns[i] = { ...ns[i], title: e.target.value };
                      setEditing({ ...editing, sections: ns });
                    }}
                    placeholder="Section title"
                    style={inputStyle}
                  />
                  <input
                    value={sec.icon}
                    onChange={(e) => {
                      const ns = [...editing.sections];
                      ns[i] = { ...ns[i], icon: e.target.value };
                      setEditing({ ...editing, sections: ns });
                    }}
                    placeholder="Icon (fas fa-*)"
                    style={{ ...inputStyle, width: 180 }}
                  />
                  <button onClick={() => {
                    setEditing({ ...editing, sections: editing.sections.filter((_, idx) => idx !== i) });
                  }} style={{ color: '#ff0055', background: 'none', border: 'none', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
                <textarea
                  value={sec.content}
                  onChange={(e) => {
                    const ns = [...editing.sections];
                    ns[i] = { ...ns[i], content: e.target.value };
                    setEditing({ ...editing, sections: ns });
                  }}
                  placeholder="Section content (Markdown supported: **bold**, bullet points)"
                  style={{ ...inputStyle, minHeight: 120, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
                />
              </div>
            ))}
            <button onClick={() => {
              setEditing({
                ...editing,
                sections: [...editing.sections, { title: 'New Section', icon: 'fas fa-circle', content: '' }],
              });
            }} style={{
              padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#aaa', cursor: 'pointer', fontSize: 12,
            }}>
              + Add Section
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={saveProject} style={{
              padding: '10px 28px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #00f3ff, #bc13fe)', color: '#fff', fontWeight: 700, cursor: 'pointer',
            }}>
              Save Project
            </button>
            <button onClick={() => setEditing(null)} style={{
              padding: '10px 28px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: '#888', cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* JSON Output */}
      {jsonOutput && (
        <div style={{
          background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)',
          borderRadius: 16, padding: 24, marginBottom: 40,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ color: '#00ff88', margin: 0 }}>
              {copied ? 'Copied!' : 'Generated JSON — copy this to static/data/projects-showcase.json'}
            </h3>
            <button onClick={copyJson} style={{
              padding: '8px 20px', borderRadius: 6, border: '1px solid #00ff88',
              background: 'rgba(0,255,136,0.1)', color: '#00ff88', cursor: 'pointer', fontSize: 12,
            }}>
              Copy
            </button>
          </div>
          <pre style={{
            background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 8,
            color: '#ccc', fontSize: 12, overflow: 'auto', maxHeight: 400,
            fontFamily: 'monospace', lineHeight: 1.5,
          }}>
            {jsonOutput}
          </pre>
          <p style={{ color: '#666', fontSize: 11, marginTop: 12, fontFamily: 'monospace' }}>
            Paste this into static/data/projects-showcase.json, then run <code style={{ color: '#00f3ff' }}>npm run build</code>
          </p>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
  color: '#fff', fontSize: 13, outline: 'none',
};

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ display: 'block', color: '#888', fontSize: 11, fontFamily: 'monospace', marginBottom: 4, textTransform: 'uppercase' }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || label} style={inputStyle} />
    </div>
  );
}

function SelectField({ label, value, options, labels, onChange }: { label: string; value: string; options: string[]; labels: string[][]; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', color: '#888', fontSize: 11, fontFamily: 'monospace', marginBottom: 4, textTransform: 'uppercase' }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' } as React.CSSProperties}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
