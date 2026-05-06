import { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';

interface DomainEntry {
  id: string;
  label: string;
  icon: string;
  color: string;
  visible: boolean;
  pages: { slug: string; visible: boolean }[];
}

interface DocsManifest {
  autoBuild: boolean;
  domains: DomainEntry[];
}

interface KnowledgeViewProps {
  visible: boolean;
  activeKnowledgeId?: string | null;
  activeTopic?: unknown;
  onSelectDomain?: (id: string | null) => void;
  onSelectTopic?: (topic: unknown) => void;
}

function useManifest(): { domains: DomainEntry[]; loading: boolean } {
  const [domains, setDomains] = useState<DomainEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/docs-manifest.json')
      .then((r) => r.json())
      .then((m: DocsManifest) => {
        setDomains(m.domains.filter((d) => d.visible));
      })
      .catch(() => {
        // Fallback: hardcoded domains if manifest unavailable
        setDomains([
          { id: 'genai', label: 'Generative AI & LLMs', icon: 'fas fa-robot', color: '#00f3ff', visible: true, pages: [] },
          { id: 'systems-analysis', label: 'Systems Analysis', icon: 'fas fa-sitemap', color: '#bc13fe', visible: true, pages: [] },
          { id: 'product-management', label: 'Product Management', icon: 'fas fa-tasks', color: '#ffaa00', visible: true, pages: [] },
          { id: 'cloud-architecture', label: 'Cloud Architecture', icon: 'fas fa-cloud', color: '#00ff88', visible: true, pages: [] },
          { id: 'cybersecurity', label: 'Cybersecurity', icon: 'fas fa-shield-alt', color: '#ff0055', visible: true, pages: [] },
          { id: 'data-analytics', label: 'Data Analytics', icon: 'fas fa-chart-pie', color: '#f3f4f6', visible: true, pages: [] },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { domains, loading };
}

export default function KnowledgeView({ visible }: KnowledgeViewProps) {
  const { domains, loading } = useManifest();

  return (
    <div
      className={`absolute inset-0 z-20 overflow-y-auto overflow-x-hidden transition-opacity duration-500 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'
      }`}
      style={{ background: 'radial-gradient(circle at 50% 0%, #200a2e 0%, #030305 60%)' }}
    >
      <div className="max-w-[1200px] mx-auto min-h-screen px-6 pt-32 pb-16 flex flex-col gap-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <i className="fas fa-brain text-[#bc13fe] mr-4" />
            The Brain
          </h2>
          <p className="font-mono text-sm text-gray-400 tracking-[0.1em] uppercase">
            Core Architect Knowledge Base
          </p>
          <p className="font-mono text-xs text-gray-500 mt-4 max-w-2xl mx-auto">
            Select a domain to explore detailed documentation, architecture patterns, and technical deep-dives.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#bc13fe]/20 border-t-[#bc13fe] rounded-full animate-spin" />
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-mono text-sm">No knowledge domains configured yet.</p>
            <p className="text-gray-600 font-mono text-xs mt-2">Edit <code className="text-[#bc13fe]">static/docs-manifest.json</code> to add domains.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <Link
                key={domain.id}
                to={`/docs/${domain.id}`}
                className="!no-underline"
              >
                <div className="p-6 rounded-2xl cursor-pointer border bg-[#0a0c12]/80 border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 flex flex-col group relative overflow-hidden h-full">
                  <div
                    className="absolute top-0 right-0 w-32 h-32 opacity-20 rounded-full blur-3xl pointer-events-none group-hover:opacity-40 transition-opacity"
                    style={{ background: domain.color }}
                  />
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <i className={`${domain.icon} text-xl`} style={{ color: domain.color }} />
                    </div>
                    <h3 className="font-bold text-white text-xl group-hover:text-white transition-colors">
                      {domain.label}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-2 uppercase tracking-wide">
                      {domain.pages?.length || 0} articles
                    </p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-1 text-xs font-mono text-gray-500 group-hover:text-white/70 transition-colors">
                    <i className="fas fa-arrow-right text-[10px]" />
                    <span>Explore docs</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
