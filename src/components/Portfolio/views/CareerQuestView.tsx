import { useEffect, useState, useCallback } from 'react';
import type { NodeData } from '../data/constants';
import { NODE_COLORS } from '../data/constants';
import { getNodeData } from '../data/helpers';
import { Accordion } from '../ui';
import type { CareerQuestReturn, GameEvent, GameState } from '../galaxy/useCareerQuest';

interface Props {
  visible: boolean;
  quest: CareerQuestReturn | null;
  activeNode: string | null;
  onCloseNode: () => void;
}

function AchievementPopup({ event, onDone }: { event: GameEvent; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="animate-fade-in bg-[#0a0c12]/95 border rounded-xl px-5 py-3 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.8)]" style={{ borderColor: (event.data?.color || '#fff') + '40' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: (event.data?.color || '#fff') + '20', color: event.data?.color }}>
          <i className={event.data?.icon || 'fas fa-star'} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-white font-mono">Achievement Unlocked!</p>
          <p className="text-[10px] font-mono" style={{ color: event.data?.color }}>{event.data?.name}</p>
        </div>
      </div>
    </div>
  );
}

function LevelUpPopup({ level, onDone }: { level: number; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="animate-fade-in bg-[#0a0c12]/95 border border-[#ffd700]/30 rounded-xl px-5 py-3 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.3)]">
      <p className="text-[11px] font-bold text-[#ffd700] font-mono text-center">
        LEVEL UP! ⬆ Level {level}
      </p>
    </div>
  );
}

function Minimap({ data, player }: { data: Array<{ x: number; z: number; color: string; found: boolean }>; player: { x: number; z: number } }) {
  const size = 140, scale = 1.2;
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm">
      {/* Ocean */}
      <rect x="-60" y="-60" width="120" height="120" fill="#1a1a2e" rx="8" />
      {/* Islands (approximate) */}
      <circle cx={0} cy={2} r={9} fill="#2a3a2e" opacity={0.6} />
      <circle cx={20} cy={-15} r={8} fill="#2a3a2e" opacity={0.6} />
      <circle cx={-20} cy={-15} r={8} fill="#2a3a2e" opacity={0.6} />
      <circle cx={6} cy={-26} r={6} fill="#2a3a2e" opacity={0.6} />
      {/* Crystals */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={d.x * scale}
          cy={-d.z * scale}
          r={d.found ? 1.5 : 0.8}
          fill={d.found ? d.color : '#ffffff40'}
          opacity={d.found ? 0.9 : 0.5}
        />
      ))}
      {/* Player */}
      <circle cx={player.x * scale} cy={-player.z * scale} r={2.5} fill="#00f3ff" stroke="#fff" strokeWidth={0.5}>
        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export default function CareerQuestView({ visible, quest, activeNode, onCloseNode }: Props) {
  const [showHelp, setShowHelp] = useState(true);
  const [achievementEvent, setAchievementEvent] = useState<GameEvent | null>(null);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const gameState = quest?.gameState;
  const nearby = quest?.nearbyCrystal ?? null;
  const activeNodeData = activeNode ? getNodeData(activeNode) : null;

  useEffect(() => {
    if (visible && showHelp) { const t = setTimeout(() => setShowHelp(false), 6000); return () => clearTimeout(t); }
  }, [visible, showHelp]);

  // Watch for game events
  useEffect(() => {
    const interval = setInterval(() => {
      if (!quest) return;
      const evts = quest.events;
      for (let i = 0; i < evts.length; i++) {
        if (evts[i].type === 'achievement') { setAchievementEvent(evts[i]); quest.consumeEvent(i); break; }
        if (evts[i].type === 'levelup') { setLevelUpLevel(evts[i].data?.level || 0); quest.consumeEvent(i); break; }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [quest]);

  // Pause menu toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible && !activeNode) {
        setShowProgress(p => !p);
      }
      if (e.key === 'Tab' && visible) {
        e.preventDefault();
        setShowProgress(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, activeNode]);

  if (!visible) return null;

  const xpPercent = gameState ? ((gameState.xp % 100) / 100) * 100 : 0;
  const activeQuest = quest ? (QUEST_LIST.find(q => q.id === gameState?.activeQuest) || null) : null;
  const crystalsFound = gameState?.crystalsFound.length || 0;
  const chaptersRead = gameState?.chaptersRead.length || 0;
  const achievementsUnlocked = gameState?.achievements.length || 0;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-500">
      {/* ━━━ Top HUD bar ━━━ */}
      <div className="absolute top-28 left-4 md:left-8 right-4 md:right-8 z-[260] pointer-events-auto">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Level badge */}
          <div className="bg-[#0a0c12]/80 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md">
            <span className="text-[10px] font-mono text-white/40">LVL</span>
            <span className="text-sm font-bold text-[#ffd700] ml-1">{gameState?.level || 1}</span>
          </div>

          {/* XP bar */}
          <div className="flex-1 max-w-[200px] bg-[#0a0c12]/80 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md">
            <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1">
              <span>XP</span>
              <span>{gameState?.xp || 0} / {((gameState?.level || 1)) * 100}</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>

          {/* Discovered count */}
          <div className="bg-[#0a0c12]/80 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md flex items-center gap-2 text-[10px] font-mono">
            <span className="text-[#00ff88]" title="Crystals">{crystalsFound}</span>
            <span className="text-white/20">·</span>
            <span className="text-[#bc13fe]" title="Chapters">{chaptersRead}</span>
            <span className="text-white/20">·</span>
            <span className="text-[#ffd700]" title="Achievements">{achievementsUnlocked}</span>
          </div>

          {/* Controls */}
          <div className="bg-[#0a0c12]/80 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md flex items-center gap-3 text-[9px] font-mono text-white/30">
            <button onClick={() => quest?.toggleSound()} className="hover:text-white transition-colors text-[10px]">
              <i className={`fas ${gameState?.soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`} />
            </button>
            <button onClick={() => quest?.setQuality(quest.gameState.qualityLevel === 2 ? 0 : quest.gameState.qualityLevel === 1 ? 2 : 1)} className="hover:text-white transition-colors">
              Q{gameState?.qualityLevel || 1}
            </button>
            <button onClick={() => setShowHelp(!showHelp)} className="hover:text-white transition-colors">?</button>
            <button onClick={() => setShowProgress(!showProgress)} className="hover:text-white transition-colors">Tab</button>
          </div>
        </div>
      </div>

      {/* ━━━ Active quest ━━━ */}
      {activeQuest && !showProgress && (
        <div className="absolute top-[calc(7rem+60px)] left-4 md:left-8 z-[260] pointer-events-auto animate-fade-in">
          <div className="bg-[#0a0c12]/80 border border-[#00f3ff]/20 rounded-lg px-4 py-2 backdrop-blur-md max-w-[300px]">
            <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Active Quest</p>
            <p className="text-[11px] font-bold text-white font-mono mt-0.5">{activeQuest.title}</p>
            <p className="text-[10px] text-white/50 font-mono">{activeQuest.desc}</p>
          </div>
        </div>
      )}

      {/* ━━━ Minimap ━━━ */}
      <div className="absolute top-28 right-4 md:right-8 z-[260] pointer-events-auto">
        <Minimap data={quest?.mapData || []} player={quest?.playerPosition || { x: 0, z: 0 }} />
      </div>

      {/* ━━━ Achievement popup ━━━ */}
      {achievementEvent && (
        <div className="absolute top-[calc(7rem+10px)] left-1/2 -translate-x-1/2 z-[290] pointer-events-none">
          <AchievementPopup event={achievementEvent} onDone={() => setAchievementEvent(null)} />
        </div>
      )}

      {/* ━━━ Level up ━━━ */}
      {levelUpLevel && (
        <div className="absolute top-[calc(7rem+80px)] left-1/2 -translate-x-1/2 z-[290] pointer-events-none">
          <LevelUpPopup level={levelUpLevel} onDone={() => setLevelUpLevel(null)} />
        </div>
      )}

      {/* ━━━ Progress screen (Tab/Esc) ━━━ */}
      {showProgress && gameState && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProgress(false)} />
          <div className="relative bg-[#0a0c12]/95 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10">
            <button onClick={() => setShowProgress(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"><i className="fas fa-times text-xs" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Vy's Journey</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-mono text-white/40 uppercase mb-2">Progress</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-white/40">Level</span> <span className="text-[#ffd700] font-bold float-right">{gameState.level}</span></div>
                  <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-white/40">XP</span> <span className="text-white font-bold float-right">{gameState.xp}</span></div>
                  <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-white/40">Crystals</span> <span className="text-[#00ff88] font-bold float-right">{crystalsFound}/36</span></div>
                  <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-white/40">Chapters</span> <span className="text-[#bc13fe] font-bold float-right">{chaptersRead}/4</span></div>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-mono text-white/40 uppercase mb-2">Achievements ({achievementsUnlocked}/10)</p>
                <div className="space-y-1">
                  {ACH_LIST.map(a => {
                    const unlocked = gameState.achievements.includes(a.id);
                    return (
                      <div key={a.id} className={`flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded ${unlocked ? 'bg-white/10' : 'bg-white/5 opacity-40'}`}>
                        <i className={`${a.icon} w-4 text-center`} style={{ color: unlocked ? a.color : '#555' }} />
                        <span className={unlocked ? 'text-white' : 'text-white/30'}>{a.name}</span>
                        {unlocked && <i className="fas fa-check text-[8px] text-[#00ff88] ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ Controls help ━━━ */}
      {showHelp && (
        <div className="absolute bottom-8 left-4 md:left-8 z-[260] animate-fade-in pointer-events-auto">
          <div className="bg-[#0a0c12]/80 border border-white/10 rounded-lg px-5 py-3 backdrop-blur-md text-[10px] font-mono text-white/50 space-y-1">
            <div className="text-white/70 font-bold uppercase tracking-wider mb-1">How to Play</div>
            <div><span className="text-white/40">WASD</span> Move Vy</div>
            <div><span className="text-white/40">Mouse</span> Look · <span className="text-white/40">Click</span> Lock cursor</div>
            <div><span className="text-white/40">E</span> Collect crystal</div>
            <div><span className="text-white/40">Tab / Esc</span> Progress</div>
          </div>
        </div>
      )}

      {/* ━━━ Interaction prompt ━━━ */}
      {nearby && !activeNode && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[260] animate-fade-in pointer-events-auto">
          <div className="bg-[#0a0c12]/90 border px-6 py-3 rounded-full backdrop-blur-md text-sm text-white font-mono flex items-center gap-3" style={{ borderColor: nearby.color }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: nearby.color, boxShadow: `0 0 8px ${nearby.color}` }} />
            <span className="text-white/50">Press E to collect</span>
            <span style={{ color: nearby.color }}>{nearby.title}</span>
            {nearby.discovered && <span className="text-[10px] text-white/30">✓</span>}
          </div>
        </div>
      )}

      {/* ━━━ Island legend ━━━ */}
      <div className="absolute bottom-8 right-4 md:right-8 z-[260] pointer-events-auto">
        <div className="bg-[#0a0c12]/70 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md text-[10px] font-mono text-white/50 space-y-1">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00ff88]" />AI Valley</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ffaa00]" />Tech Peaks</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ff0055]" />Marketing</div>
        </div>
      </div>

      {/* ━━━ Intro overlay ━━━ */}
      {quest && quest.introPhase !== 'ready' && (
        <div className="fixed inset-0 z-[280] flex items-center justify-center pointer-events-none">
          <div className="text-center animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Career Quest</h2>
            <p className="text-xl font-mono text-[#00f3ff]">Vy's Journey</p>
            <p className="text-xs font-mono text-white/30 mt-8">
              {quest.introPhase === 'flying' ? 'Loading your adventure...' : 'Preparing the world...'}
            </p>
          </div>
        </div>
      )}

      {/* ━━━ Crystal detail modal ━━━ */}
      {activeNode && activeNodeData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseNode} />
          <div className="relative w-full max-w-[700px] max-h-[80dvh] max-h-[80vh] bg-[#0a0c12]/95 border border-white/10 rounded-2xl p-8 md:p-10 overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in z-10">
            <button onClick={onCloseNode} className="absolute top-6 right-6 w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all z-[310]">
              <i className="fas fa-times" />
            </button>
            <div className="mb-6 border-b border-white/5 pb-6">
              <div className="inline-block px-3 py-1 border rounded font-mono text-[10px] font-bold uppercase mb-4" style={{ color: activeNodeData.color, borderColor: activeNodeData.color }}>
                {activeNode.startsWith('proj') ? 'Project' : activeNode.startsWith('cert') ? 'Certification' : 'Community'}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2" style={{ color: activeNodeData.color }}>{activeNodeData.title}</h2>
              <p className="font-mono text-[11px] text-gray-400 uppercase tracking-widest">{activeNodeData.subtitle}</p>
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

const QUEST_LIST = [
  { id: 'q1', title: 'Begin Your Journey', desc: 'Discover your first crystal' },
  { id: 'q2', title: 'Learn the Story', desc: 'Read a chapter sign' },
  { id: 'q3', title: 'Visit AI Valley', desc: 'Travel to the Projects island (northeast)' },
  { id: 'q4', title: 'Explore Tech Peaks', desc: 'Travel to the Certs island (northwest)' },
  { id: 'q5', title: 'Crystal Hunter', desc: 'Discover 5 crystals' },
  { id: 'q6', title: 'Read Your Story', desc: 'Read 2 chapters' },
  { id: 'q7', title: 'Visit Marketing Shores', desc: 'Travel to Community island (south)' },
  { id: 'q8', title: 'Halfway There', desc: 'Discover 18 crystals' },
  { id: 'q9', title: 'The Full Story', desc: 'Read all 4 chapters' },
  { id: 'q10', title: 'Master Explorer', desc: 'Discover all 36 crystals' },
];

const ACH_LIST = [
  { id: 'first_steps', name: 'First Steps', icon: 'fas fa-gem', color: '#00f3ff' },
  { id: 'explorer', name: 'Explorer', icon: 'fas fa-compass', color: '#00ff88' },
  { id: 'scholar', name: 'Scholar', icon: 'fas fa-graduation-cap', color: '#ffaa00' },
  { id: 'storyteller', name: 'Storyteller', icon: 'fas fa-book-open', color: '#bc13fe' },
  { id: 'marketing_seed', name: 'Marketing Seed', icon: 'fas fa-paint-brush', color: '#ffaa00' },
  { id: 'tech_awakening', name: 'Tech Awakening', icon: 'fas fa-laptop-code', color: '#00f3ff' },
  { id: 'ai_architect', name: 'AI Architect', icon: 'fas fa-microchip', color: '#00ff88' },
  { id: 'collector', name: 'Collector', icon: 'fas fa-star', color: '#ff6b6b' },
  { id: 'level_5', name: 'Level 5', icon: 'fas fa-arrow-up', color: '#ffaa00' },
  { id: 'master', name: 'Career Master', icon: 'fas fa-crown', color: '#ffd700' },
];
