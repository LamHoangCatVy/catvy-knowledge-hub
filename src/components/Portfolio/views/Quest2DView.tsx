import { useState, useEffect } from 'react';
import type { NodeData } from '../data/constants';
import { NODE_COLORS } from '../data/constants';
import { getNodeData } from '../data/helpers';
import { Accordion } from '../ui';
import type { Quest2DState } from '../galaxy/useQuest2D';

interface Props {
  visible: boolean;
  state: Quest2DState | null;
  showStory: { title: string; color: string; text: string[] } | null;
  dismissStory: () => void;
  toggleSound: () => void;
  setQuality: (q: number) => void;
  lastAchievement: { name: string; color: string; icon: string } | null;
  levelUp: number | null;
  activeNode: string | null;
  onCloseNode: () => void;
}

export default function Quest2DView({
  visible, state, showStory, dismissStory, toggleSound, setQuality,
  lastAchievement, levelUp, activeNode, onCloseNode,
}: Props) {
  const [showHelp, setShowHelp] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const activeNodeData = activeNode ? getNodeData(activeNode) : null;

  useEffect(() => { if (visible && showHelp) { const t = setTimeout(() => setShowHelp(false), 6000); return () => clearTimeout(t); } }, [visible, showHelp]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && visible) { e.preventDefault(); setShowProgress(p => !p); }
      if (e.key === 'Escape' && visible) { if (showProgress) setShowProgress(false); if (showStory) dismissStory(); }
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [visible, showProgress, showStory, dismissStory]);

  if (!visible || !state) return null;

  const xpPct = ((state.xp % 100) / 100) * 100;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-500">
      {/* ━━━ Top bar ━━━ */}
      <div className="absolute top-28 left-4 md:left-8 right-4 md:right-8 z-[260] pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#0a0c12]/85 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md">
            <span className="text-[9px] font-mono text-white/30">LVL</span>
            <span className="text-sm font-bold text-[#ffd700] ml-1">{state.level}</span>
          </div>
          <div className="flex-1 max-w-[180px] bg-[#0a0c12]/85 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] rounded-full transition-all duration-500" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
          <div className="bg-[#0a0c12]/85 border border-white/10 rounded-lg px-2 py-1 backdrop-blur-md flex items-center gap-2 text-[9px] font-mono">
            <span className="text-[#00ff88]">{state.crystalsFound}/{36}</span>
            <span className="text-white/20">·</span>
            <span className="text-[#bc13fe]">{state.chaptersRead}/4</span>
            <span className="text-white/20">·</span>
            <span className="text-[#ffd700]">{state.achievements.length}/9</span>
          </div>
          <div className="flex gap-1">
            <button onClick={toggleSound} className="bg-[#0a0c12]/85 border border-white/10 rounded-lg px-2 py-1 backdrop-blur-md text-[10px] text-white/40 hover:text-white transition-colors">
              <i className={`fas fa-${state.soundOn ? 'volume-up' : 'volume-mute'}`} />
            </button>
            <button onClick={() => setShowHelp(!showHelp)} className="bg-[#0a0c12]/85 border border-white/10 rounded-lg px-2 py-1 backdrop-blur-md text-[10px] text-white/40 hover:text-white transition-colors">?</button>
            <button onClick={() => setShowProgress(!showProgress)} className="bg-[#0a0c12]/85 border border-white/10 rounded-lg px-2 py-1 backdrop-blur-md text-[10px] text-white/40 hover:text-white transition-colors">TAB</button>
          </div>
        </div>
      </div>

      {/* ━━━ Achievement pop ━━━ */}
      {lastAchievement && (
        <div className="absolute top-[calc(7rem+50px)] left-1/2 -translate-x-1/2 z-[290] pointer-events-none animate-fade-in">
          <div className="bg-[#0a0c12]/95 border rounded-xl px-5 py-3 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-3" style={{ borderColor: lastAchievement.color + '40' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: lastAchievement.color + '20', color: lastAchievement.color }}>
              <i className={lastAchievement.icon} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white font-mono">Achievement</p>
              <p className="text-[10px] font-mono" style={{ color: lastAchievement.color }}>{lastAchievement.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ Level up ━━━ */}
      {levelUp && (
        <div className="absolute top-[calc(7rem+100px)] left-1/2 -translate-x-1/2 z-[290] pointer-events-none animate-fade-in">
          <div className="bg-[#0a0c12]/95 border border-[#ffd700]/30 rounded-xl px-5 py-3 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.3)]">
            <p className="text-[11px] font-bold text-[#ffd700] font-mono text-center">LEVEL UP! ⬆ {levelUp}</p>
          </div>
        </div>
      )}

      {/* ━━━ Story pop ━━━ */}
      {showStory && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismissStory} />
          <div className="relative bg-[#0a0c12]/95 border rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10" style={{ borderColor: showStory.color + '40' }}>
            <button onClick={dismissStory} className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"><i className="fas fa-times text-xs" /></button>
            <h3 className="text-xl font-bold text-white mb-4" style={{ color: showStory.color }}>{showStory.title}</h3>
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
              {showStory.text.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      )}

      {/* ━━━ Progress screen ━━━ */}
      {showProgress && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProgress(false)} />
          <div className="relative bg-[#0a0c12]/95 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 max-h-[80vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10">
            <button onClick={() => setShowProgress(false)} className="absolute top-3 right-3 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"><i className="fas fa-times text-xs" /></button>
            <h3 className="text-lg font-bold text-white mb-4">Vy's Journey</h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-4">
              <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-white/40">Level</span> <span className="text-[#ffd700] font-bold float-right">{state.level}</span></div>
              <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-white/40">XP</span> <span className="text-white float-right">{state.xp}</span></div>
              <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-white/40">Crystals</span> <span className="text-[#00ff88] font-bold float-right">{state.crystalsFound}/36</span></div>
              <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-white/40">Chapters</span> <span className="text-[#bc13fe] font-bold float-right">{state.chaptersRead}/4</span></div>
            </div>
            <p className="text-[10px] font-mono text-white/40 uppercase mb-2">Achievements ({state.achievements.length}/9)</p>
            <div className="space-y-1">
              {ACH_LIST.map(a => {
                const u = state.achievements.includes(a.id);
                return (
                  <div key={a.id} className={`flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded ${u ? 'bg-white/10' : 'bg-white/5 opacity-40'}`}>
                    <i className={`${a.icon} w-4 text-center`} style={{ color: u ? a.color : '#555' }} />
                    <span className={u ? 'text-white' : 'text-white/30'}>{a.name}</span>
                    {u && <i className="fas fa-check text-[7px] text-[#00ff88] ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ━━━ Help ━━━ */}
      {showHelp && (
        <div className="absolute bottom-6 left-4 md:left-8 z-[260] animate-fade-in pointer-events-auto">
          <div className="bg-[#0a0c12]/85 border border-white/10 rounded-lg px-4 py-2.5 backdrop-blur-md text-[10px] font-mono text-white/45 space-y-1">
            <div className="text-white/65 font-bold uppercase tracking-wider mb-1">How to Play</div>
            <div><span className="text-white/40">WASD</span> Move · <span className="text-white/40">E</span> Interact</div>
            <div><span className="text-white/40">Tab</span> Progress · <span className="text-white/40">Esc</span> Close</div>
          </div>
        </div>
      )}

      {/* ━━━ Interaction ━━━ */}
      {state.nearby && !activeNode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[260] animate-fade-in pointer-events-auto">
          <div className="bg-[#0a0c12]/90 border px-5 py-2.5 rounded-full backdrop-blur-md text-xs text-white font-mono flex items-center gap-2" style={{ borderColor: state.nearby.color }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: state.nearby.color }} />
            <span className="text-white/40">E</span>
            <span style={{ color: state.nearby.color }}>
              {state.nearby.type === 'chapter' ? '📖 ' : ''}{state.nearby.title}
            </span>
          </div>
        </div>
      )}

      {/* ━━━ Crystal detail modal ━━━ */}
      {activeNode && activeNodeData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseNode} />
          <div className="relative w-full max-w-[650px] max-h-[80dvh] bg-[#0a0c12]/95 border border-white/10 rounded-2xl p-6 md:p-10 overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in z-10">
            <button onClick={onCloseNode} className="absolute top-5 right-5 w-9 h-9 border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white"><i className="fas fa-times" /></button>
            <div className="mb-5 border-b border-white/5 pb-5">
              <div className="inline-block px-3 py-1 border rounded font-mono text-[10px] font-bold uppercase mb-3" style={{ color: activeNodeData.color, borderColor: activeNodeData.color }}>
                {activeNode.startsWith('proj') ? 'Project' : activeNode.startsWith('cert') ? 'Certification' : 'Community'}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1" style={{ color: activeNodeData.color }}>{activeNodeData.title}</h2>
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{activeNodeData.subtitle}</p>
            </div>
            {activeNodeData.type === 'sub' && (
              <div className="space-y-1">
                <Accordion icon="fas fa-eye" title="Vision" content={activeNodeData.vision} color={NODE_COLORS.core} />
                <Accordion icon="fas fa-sitemap" title="Architecture" content={activeNodeData.arch} color={NODE_COLORS.brain} />
                <Accordion icon="fas fa-code" title="Implementation" content={activeNodeData.impl} color="#ffffff" />
                <Accordion icon="fas fa-chart-line" title="Impact" content={activeNodeData.busCase} color={NODE_COLORS.warn} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ACH_LIST = [
  { id: 'first_steps', name: 'First Steps', icon: 'fas fa-gem', color: '#00f3ff' },
  { id: 'explorer', name: 'Explorer', icon: 'fas fa-compass', color: '#00ff88' },
  { id: 'scholar', name: 'Scholar', icon: 'fas fa-graduation-cap', color: '#ffaa00' },
  { id: 'storyteller', name: 'Storyteller', icon: 'fas fa-book-open', color: '#bc13fe' },
  { id: 'marketing', name: 'Marketing Roots', icon: 'fas fa-paint-brush', color: '#ffaa00' },
  { id: 'tech', name: 'Tech Awakening', icon: 'fas fa-laptop-code', color: '#00f3ff' },
  { id: 'ai', name: 'AI Architect', icon: 'fas fa-microchip', color: '#00ff88' },
  { id: 'level5', name: 'Level 5', icon: 'fas fa-arrow-up', color: '#ffaa00' },
  { id: 'master', name: 'Master', icon: 'fas fa-crown', color: '#ffd700' },
];
