import { useEffect, useState } from 'react';
import type { NodeData } from '../data/constants';
import { NODE_COLORS } from '../data/constants';
import { Accordion } from '../ui';
import type { AdventureWorldReturn } from '../galaxy/useAdventureWorld';

interface AdventureViewProps {
  visible: boolean;
  world: AdventureWorldReturn | null;
  activeNode: string | null;
  activeNodeData: NodeData | null;
  onCloseNode: () => void;
  onInteractNode: (id: string) => void;
}

const CHAPTER_DATA: Record<string, { title: string; subtitle: string; year: string; color: string; paragraphs: string[] }> = {
  chapter_1: {
    title: 'The Marketing Seed',
    subtitle: 'Graphic Designer · NGO Volunteer',
    year: '2016 – 2019',
    color: '#ffaa00',
    paragraphs: [
      'Vy started as a graphic designer for The Middle Man NGO, crafting visual stories that connected with young audiences. She learned that communication — not just technology — is the foundation of impact.',
      'As Head of Marketing for The Patronous, she built an ecosystem helping teenagers overcome challenges. From 0 to 5K+ followers, she discovered her talent for bridging communities with ideas.',
    ],
  },
  chapter_2: {
    title: 'The Technical Awakening',
    subtitle: 'Cloud Engineer · Pre-Sales Architect',
    year: '2019 – 2023',
    color: '#00f3ff',
    paragraphs: [
      'The pivot came when Vy realized technology could scale her impact beyond any single community. She dove into cloud computing, earning AWS certifications while designing PoCs that won international telecom contracts.',
      'At Cloud Kinetics, she drafted SOWs for Softel US/VN, designed AWS Landing Zones for e-commerce migrations, and learned to translate business requirements into technical architecture.',
    ],
  },
  chapter_3: {
    title: 'The AI Architecture',
    subtitle: 'Senior Systems Analyst · my company',
    year: '2024 – Present',
    color: '#00ff88',
    paragraphs: [
      'At my company, Vy found her calling — architecting Generative AI systems that serve thousands of employees. ezPolicy transformed policy search from <20% to >90% accuracy.',
      'She designed the ezGenAI foundation platform supporting 100+ AI use cases bankwide, built the Prompt Security Gate achieving 100% compliance, and created the IT Young Talents 4-step funnel.',
    ],
  },
  chapter_4: {
    title: 'The Open Future',
    subtitle: 'Community Builder · Open Source Creator',
    year: 'Now & Beyond',
    color: '#bc13fe',
    paragraphs: [
      'Every crystal you discover is a real project or certification. Walk the islands, explore the achievements, and see how one person — starting from graphic design — built an AI architecture career.',
      'The journey continues. yummy, the open-source multi-agent platform, invites anyone to build AI agents. Vy\'s story proves that non-linear paths create the most interesting architects.',
    ],
  },
};

export default function AdventureView({
  visible,
  world,
  activeNode,
  activeNodeData,
  onCloseNode,
  onInteractNode,
}: AdventureViewProps) {
  const [showHelp, setShowHelp] = useState(true);
  const [showStory, setShowStory] = useState(false);
  const [chapter, setChapter] = useState<string | null>(null);

  const nearbyNode = world?.nearbyNode ?? null;
  const playerPos = world?.playerPosition ?? { x: 0, z: 0, islands: 'Hub' };
  const qualityLevel = world?.qualityLevel ?? 1;
  const activeChapter = world?.activeChapter ?? null;
  const onSetQuality = world?.setQualityLevel ?? (() => {});

  useEffect(() => {
    if (visible && showHelp) {
      const t = setTimeout(() => setShowHelp(false), 8000);
      return () => clearTimeout(t);
    }
  }, [visible, showHelp]);

  useEffect(() => {
    if (activeChapter) {
      setChapter(activeChapter);
      setShowStory(true);
      const t = setTimeout(() => setShowStory(false), 12000);
      return () => clearTimeout(t);
    }
  }, [activeChapter]);

  return (
    <div
      className={`fixed inset-0 z-30 pointer-events-none transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* ━━━ HUD Top-Left ━━━ */}
      <div className="absolute top-28 left-4 md:left-8 z-[260] space-y-2">
        <div className="bg-[#0a0c12]/80 border border-white/10 rounded-lg px-4 py-3 backdrop-blur-md text-xs font-mono text-white/70 space-y-1">
          <div>
            <span className="text-white/40">ZONE</span>{' '}
            <span className="text-[#00f3ff]">{playerPos.islands}</span>
          </div>
          <div className="flex gap-4">
            <span><span className="text-white/40">X</span> {playerPos.x.toFixed(0)}</span>
            <span><span className="text-white/40">Z</span> {playerPos.z.toFixed(0)}</span>
          </div>
        </div>

        {/* Quality toggle */}
        <div className="bg-[#0a0c12]/80 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md text-[10px] font-mono text-white/50 flex items-center gap-2 pointer-events-auto">
          <span>Quality:</span>
          {[0, 1, 2].map((l) => (
            <button
              key={l}
              onClick={() => onSetQuality(l)}
              className={`px-2 py-0.5 rounded-full transition-all ${
                qualityLevel === l
                  ? 'bg-[#00f3ff]/20 text-[#00f3ff]'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {l === 0 ? 'Low' : l === 1 ? 'Med' : 'High'}
            </button>
          ))}
        </div>
      </div>

      {/* ━━━ Story chapter popup ━━━ */}
      {showStory && chapter && CHAPTER_DATA[chapter] && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[280] pointer-events-auto animate-fade-in max-w-md w-full">
          <div
            className="bg-[#0a0c12]/95 border rounded-2xl p-6 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8)]"
            style={{ borderColor: CHAPTER_DATA[chapter].color + '40' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{CHAPTER_DATA[chapter].title}</h3>
                <p className="text-xs font-mono mt-1" style={{ color: CHAPTER_DATA[chapter].color }}>
                  {CHAPTER_DATA[chapter].subtitle}
                </p>
              </div>
              <button
                onClick={() => setShowStory(false)}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
              {CHAPTER_DATA[chapter].paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="text-[10px] font-mono text-white/30 mt-4 text-right">
              {CHAPTER_DATA[chapter].year}
            </p>
          </div>
        </div>
      )}

      {/* ━━━ Controls help ━━━ */}
      {showHelp && (
        <div className="absolute bottom-8 left-4 md:left-8 z-[260] animate-fade-in">
          <div className="bg-[#0a0c12]/80 border border-white/10 rounded-lg px-5 py-3 backdrop-blur-md text-[10px] font-mono text-white/50 space-y-1">
            <div className="text-white/70 font-bold uppercase tracking-wider mb-1">Controls</div>
            <div><span className="text-white/40">WASD</span> or <span className="text-white/40">touch drag</span> Move</div>
            <div><span className="text-white/40">Mouse</span> Look around</div>
            <div><span className="text-white/40">E / tap</span> Explore crystal</div>
            <div><span className="text-white/40">Esc</span> Close dialog</div>
          </div>
        </div>
      )}

      {/* ━━━ Mobile virtual joystick area ━━━ */}
      <div className="md:hidden absolute bottom-4 left-4 z-[260] pointer-events-auto">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/10" />
        </div>
      </div>

      {/* ━━━ Interaction prompt ━━━ */}
      {nearbyNode && !activeNode && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[260] animate-fade-in pointer-events-auto">
          <button
            onClick={() => onInteractNode(nearbyNode.id)}
            className="bg-[#0a0c12]/90 border px-6 py-3 rounded-full backdrop-blur-md text-sm text-white font-mono hover:bg-white/10 transition-all flex items-center gap-3"
            style={{ borderColor: nearbyNode.color }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: nearbyNode.color, boxShadow: `0 0 8px ${nearbyNode.color}` }}
            />
            <span className="text-white/50">Press E to explore</span>
            <span style={{ color: nearbyNode.color }}>{nearbyNode.title}</span>
          </button>
        </div>
      )}

      {/* ━━━ Map legend ━━━ */}
      <div className="absolute bottom-8 right-4 md:right-8 z-[260]">
        <div className="bg-[#0a0c12]/70 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md text-[10px] font-mono text-white/50 space-y-1">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00ff88]" />Projects</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ffaa00]" />Certs</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ff0055]" />Community</div>
        </div>
      </div>

      {/* ━━━ Node detail modal ━━━ */}
      {activeNode && activeNodeData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseNode} />

          <div className="relative w-full max-w-[700px] max-h-[80dvh] max-h-[80vh] bg-[#0a0c12]/95 border border-white/10 rounded-2xl p-8 md:p-10 overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in z-10">
            <button
              onClick={onCloseNode}
              className="absolute top-6 right-6 w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all z-[310]"
            >
              <i className="fas fa-times" />
            </button>

            <div className="mb-6 border-b border-white/5 pb-6">
              <div
                className="inline-block px-3 py-1 border rounded font-mono text-[10px] font-bold uppercase mb-4"
                style={{ color: activeNodeData.color, borderColor: activeNodeData.color }}
              >
                {activeNodeData.type === 'core' ? 'Core Domain' : activeNodeData.role}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2" style={{ color: activeNodeData.color }}>
                {activeNodeData.title}
              </h2>
              <p className="font-mono text-[11px] text-gray-400 uppercase tracking-widest">
                {activeNodeData.subtitle}
              </p>
            </div>

            {activeNodeData.type === 'sub' && (
              <div className="space-y-1">
                {activeNode.startsWith('proj') && (
                  <>
                    <Accordion icon="fas fa-eye" title="Product Vision" content={activeNodeData.vision} color={NODE_COLORS.core} />
                    <Accordion icon="fas fa-sitemap" title="Architecture" content={activeNodeData.arch} color={NODE_COLORS.brain} />
                    <Accordion icon="fas fa-code" title="Implementation" content={activeNodeData.impl} color="#ffffff" />
                    <Accordion icon="fas fa-chart-line" title="Business Impact" content={activeNodeData.busCase} color={NODE_COLORS.warn} />
                  </>
                )}
                {activeNode.startsWith('cert') && (
                  <>
                    <Accordion icon="fas fa-bullseye" title="Core Objective" content={activeNodeData.vision} color={NODE_COLORS.core} />
                    <Accordion icon="fas fa-layer-group" title="Covered Architecture" content={activeNodeData.arch} color={NODE_COLORS.brain} />
                    <Accordion icon="fas fa-briefcase" title="Practical Application" content={activeNodeData.impl} color="#ffffff" />
                    <Accordion icon="fas fa-chart-bar" title="Professional Value" content={activeNodeData.busCase} color={NODE_COLORS.warn} />
                  </>
                )}
                {activeNode.startsWith('comm') && (
                  <>
                    <Accordion icon="fas fa-globe" title="Vision & Scope" content={activeNodeData.vision} color={NODE_COLORS.core} />
                    <Accordion icon="fas fa-users-cog" title="Execution" content={activeNodeData.arch} color={NODE_COLORS.brain} />
                    <Accordion icon="fas fa-hands-helping" title="My Contribution" content={activeNodeData.impl} color="#ffffff" />
                    <Accordion icon="fas fa-seedling" title="Ecosystem Impact" content={activeNodeData.busCase} color={NODE_COLORS.warn} />
                  </>
                )}
              </div>
            )}

            {activeNodeData.tags && (
              <div className="flex flex-wrap gap-2 mt-8">
                {activeNodeData.tags.map((t: string) => (
                  <span key={t} className="inline-flex items-center text-[10px] font-mono px-3 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10 uppercase">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
