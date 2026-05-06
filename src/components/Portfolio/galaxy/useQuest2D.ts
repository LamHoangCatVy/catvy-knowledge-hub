import { useRef, useEffect, useCallback, type RefObject } from 'react';

// ─── 2D Map Data ───
const MAP_W = 1000, MAP_H = 1000;
const SCALE = 6; // pixels per world unit
const TILE = 64; // tile size in world units

interface Island {
  name: string; cx: number; cy: number; rx: number; ry: number; color: string; shoreColor: string; chapterId?: string;
}
const ISLANDS: Island[] = [
  { name: 'The Hub', cx: 500, cy: 480, rx: 70, ry: 65, color: '#2d5a3a', shoreColor: '#c2b280', chapterId: 'chapter_4' },
  { name: 'AI Valley', cx: 680, cy: 340, rx: 80, ry: 70, color: '#1a4a2e', shoreColor: '#d4c590', chapterId: 'chapter_3' },
  { name: 'Tech Peaks', cx: 280, cy: 340, rx: 75, ry: 65, color: '#2a4a3e', shoreColor: '#c8b880', chapterId: 'chapter_2' },
  { name: 'Marketing Shores', cx: 540, cy: 720, rx: 65, ry: 55, color: '#3a5a3a', shoreColor: '#dac890', chapterId: 'chapter_1' },
];

interface CrystalData {
  id: string; title: string; color: string; type: 'proj' | 'cert' | 'comm';
  island: number; // index into ISLANDS
}
interface ChapterData {
  id: string; title: string; color: string; island: number;
}

const CRYSTALS: CrystalData[] = [];
import { PROJECTS_DATA } from '../data/projects';
import { CERTS_DATA } from '../data/certifications';
import { COMMUNITY_DATA } from '../data/community';

PROJECTS_DATA.forEach(p => CRYSTALS.push({ id: p.id, title: p.title, color: '#00ff88', type: 'proj', island: 1 }));
CERTS_DATA.forEach(c => CRYSTALS.push({ id: c.id, title: c.title, color: '#ffaa00', type: 'cert', island: 2 }));
COMMUNITY_DATA.forEach(c => CRYSTALS.push({ id: c.id, title: c.title, color: '#ff0055', type: 'comm', island: 3 }));

const CHAPTERS: ChapterData[] = [
  { id: 'chapter_1', title: 'The Marketing Seed', color: '#ffaa00', island: 3 },
  { id: 'chapter_2', title: 'The Technical Awakening', color: '#00f3ff', island: 2 },
  { id: 'chapter_3', title: 'The AI Architecture', color: '#00ff88', island: 1 },
  { id: 'chapter_4', title: 'The Open Future', color: '#bc13fe', island: 0 },
];

const CHAPTER_STORY: Record<string, string[]> = {
  chapter_1: ['Vy started as a graphic designer for The Middle Man NGO, crafting visual stories that connected with young audiences. She learned that communication — not just technology — is the foundation of impact.', 'As Head of Marketing for The Patronous, she built an ecosystem helping teenagers overcome challenges. From 0 to 5K+ followers, she discovered her talent for bridging communities with ideas.'],
  chapter_2: ['The pivot came when Vy realized technology could scale her impact beyond any single community. She dove into cloud computing, earning AWS certifications while designing PoCs that won international contracts.', 'At Cloud Kinetics, she drafted SOWs for Softel US/VN, designed Landing Zones for migrations, and learned to translate business requirements into technical architecture.'],
  chapter_3: ['At my company, Vy architected Generative AI systems serving thousands of employees. ezPolicy transformed policy search from <20% to >90% accuracy. The ezGenAI platform supports 100+ AI use cases bankwide.', 'She built the Prompt Security Gate achieving 100% compliance, created the IT Young Talents 4-step funnel, and designed scalable AI workflows across the banking group.'],
  chapter_4: ['Every crystal you discover is a real project or certification. Walk the islands, explore the achievements, and see how one person — starting from graphic design — built an AI architecture career.', 'The journey continues. Open-source multi-agent platforms, AWS community building, and mentorship programs. Vy proves that non-linear paths create the most interesting architects.'],
};

// ─── Game State ───
const SAVE_KEY = 'cv-quest-2d';
const TOTAL_CRYSTALS = CRYSTALS.length;
const XP_CRYSTAL = 10, XP_CHAPTER = 25, XP_QUEST = 50, XP_LVL = 100;

interface SavedState {
  xp: number; level: number; crystalsFound: string[]; chaptersRead: string[];
  achievements: string[]; questsCompleted: string[]; activeQuest: string;
  soundOn: boolean; quality: number;
}

const ACHIEVEMENTS = [
  { id: 'first_steps', name: 'First Steps', desc: 'Discover first crystal', icon: 'fas fa-gem', color: '#00f3ff' },
  { id: 'explorer', name: 'Explorer', desc: 'Visit all 4 islands', icon: 'fas fa-compass', color: '#00ff88' },
  { id: 'scholar', name: 'Scholar', desc: 'Find all crystals', icon: 'fas fa-graduation-cap', color: '#ffaa00' },
  { id: 'storyteller', name: 'Storyteller', desc: 'Read all chapters', icon: 'fas fa-book-open', color: '#bc13fe' },
  { id: 'marketing', name: 'Marketing Roots', desc: 'Visit Marketing Shores', icon: 'fas fa-paint-brush', color: '#ffaa00' },
  { id: 'tech', name: 'Tech Awakening', desc: 'Visit Tech Peaks', icon: 'fas fa-laptop-code', color: '#00f3ff' },
  { id: 'ai', name: 'AI Architect', desc: 'Visit AI Valley', icon: 'fas fa-microchip', color: '#00ff88' },
  { id: 'level5', name: 'Level 5', desc: 'Reach level 5', icon: 'fas fa-arrow-up', color: '#ffaa00' },
  { id: 'master', name: 'Master', desc: '100% complete', icon: 'fas fa-crown', color: '#ffd700' },
];

const QUESTS = [
  { id: 'q1', title: 'Begin', desc: 'Find your first crystal', target: 1, type: 'crystal' as const },
  { id: 'q2', title: 'Read', desc: 'Read a chapter', target: 1, type: 'chapter' as const },
  { id: 'q3', title: 'Explore AI Valley', desc: 'Visit the green island', target: 1, type: 'island_1' as const },
  { id: 'q4', title: 'Explore Tech Peaks', desc: 'Visit the gold island', target: 1, type: 'island_2' as const },
  { id: 'q5', title: 'Crystal Hunter', desc: 'Find 5 crystals', target: 5, type: 'crystal' as const },
  { id: 'q6', title: 'Story Time', desc: 'Read 2 chapters', target: 2, type: 'chapter' as const },
  { id: 'q7', title: 'Marketing Shores', desc: 'Visit the pink island', target: 1, type: 'island_3' as const },
  { id: 'q8', title: 'Halfway', desc: 'Find 18 crystals', target: 18, type: 'crystal' as const },
];

// ─── Save/Load ───
function load(): SavedState {
  try { const r = localStorage.getItem(SAVE_KEY); if (r) return JSON.parse(r); } catch {}
  return { xp: 0, level: 1, crystalsFound: [], chaptersRead: [], achievements: [], questsCompleted: [], activeQuest: 'q1', soundOn: false, quality: 1 };
}
function save(s: SavedState) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch {} }

// ─── Sound ───
let audioCtx: AudioContext | null = null;
function beep(f: number, d: number, t: OscillatorType = 'sine') {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = t; o.frequency.value = f;
  g.gain.setValueAtTime(0.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + d);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + d);
}

// ─── Types ───
interface NearbyInfo { id: string; title: string; color: string; type: 'crystal' | 'chapter' }
export interface Quest2DState {
  xp: number; level: number; crystalsFound: number; chaptersRead: number;
  achievements: string[]; activeQuest: string | null; questProgress: number; questTarget: number;
  soundOn: boolean; quality: number; player: { x: number; y: number; island: string };
  nearby: NearbyInfo | null;
}

// ─── Main Hook ───
export function useQuest2D(onInteract: (nodeId: string) => void): {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  state: Quest2DState;
  showStory: { title: string; color: string; text: string[] } | null;
  dismissStory: () => void;
  toggleSound: () => void;
  setQuality: (q: number) => void;
  lastAchievement: { name: string; color: string; icon: string } | null;
  levelUp: number | null;
} {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<Quest2DState>({
    xp: 0, level: 1, crystalsFound: 0, chaptersRead: 0, achievements: [],
    activeQuest: 'q1', questProgress: 0, questTarget: 1, soundOn: false, quality: 1,
    player: { x: 500, y: 460, island: 'The Hub' }, nearby: null,
  });
  const savedRef = useRef<SavedState>(load());
  const storyRef = useRef<{ title: string; color: string; text: string[] } | null>(null);
  const achRef = useRef<{ name: string; color: string; icon: string } | null>(null);
  const lvlRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const mapCacheRef = useRef<ImageData | null>(null);
  const storyDismissRef = useRef<() => void>(() => {});
  const visitedRef = useRef<Set<string>>(new Set());
  const stateSnapshotRef = useRef<Quest2DState>(stateRef.current);

  // Init saved state
  const sv = savedRef.current;
  stateRef.current.xp = sv.xp; stateRef.current.level = sv.level;
  stateRef.current.crystalsFound = sv.crystalsFound.length;
  stateRef.current.chaptersRead = sv.chaptersRead.length;
  stateRef.current.achievements = sv.achievements;
  stateRef.current.activeQuest = sv.activeQuest;
  stateRef.current.soundOn = sv.soundOn;
  stateRef.current.quality = sv.quality;

  const addXP = useCallback((amt: number) => {
    sv.xp += amt;
    stateRef.current.xp = sv.xp;
    const nl = Math.floor(sv.xp / XP_LVL) + 1;
    if (nl > sv.level) { sv.level = nl; stateRef.current.level = nl; lvlRef.current = nl; setTimeout(() => lvlRef.current = null, 3000); }
    save(sv);
  }, []);

  const unlockAch = useCallback((id: string) => {
    if (sv.achievements.includes(id)) return;
    sv.achievements.push(id); stateRef.current.achievements = sv.achievements;
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a) { achRef.current = a; setTimeout(() => achRef.current = null, 4000); beep(523, 0.15); setTimeout(() => beep(784, 0.2), 100); }
    save(sv);
  }, []);

  const checkQuests = useCallback(() => {
    for (const q of QUESTS) {
      if (sv.questsCompleted.includes(q.id)) continue;
      let prog = 0;
      if (q.type === 'crystal') prog = sv.crystalsFound.length;
      else if (q.type === 'chapter') prog = sv.chaptersRead.length;
      else if (q.type === 'island_1') prog = visitedRef.current.has('AI Valley') ? 1 : 0;
      else if (q.type === 'island_2') prog = visitedRef.current.has('Tech Peaks') ? 1 : 0;
      else if (q.type === 'island_3') prog = visitedRef.current.has('Marketing Shores') ? 1 : 0;
      if (prog >= q.target) {
        sv.questsCompleted.push(q.id);
        addXP(XP_QUEST);
        const next = QUESTS.findIndex(x => x.id === q.id) + 1;
        if (next < QUESTS.length) { sv.activeQuest = QUESTS[next].id; stateRef.current.activeQuest = sv.activeQuest; }
        save(sv);
      } else if (sv.activeQuest === q.id) {
        stateRef.current.questProgress = prog;
        stateRef.current.questTarget = q.target;
      }
    }
  }, [addXP]);

  // Point-in-island helper
  function pointInIsland(px: number, py: number, isl: Island): boolean {
    const dx = (px - isl.cx) / isl.rx, dy = (py - isl.cy) / isl.ry;
    return dx * dx + dy * dy <= 1.15;
  }

  function getIsland(px: number, py: number): Island | null {
    for (const i of ISLANDS) if (pointInIsland(px, py, i)) return i;
    return null;
  }

  function getIslandForPos(px: number, py: number): number {
    for (let i = ISLANDS.length - 1; i >= 0; i--) if (pointInIsland(px, py, ISLANDS[i])) return i;
    return -1;
  }

  // Generate crystal positions procedurally
  function crystalPosition(c: CrystalData): { x: number; y: number } {
    const isl = ISLANDS[c.island];
    const angle = (CRYSTALS.indexOf(c) * 2.4 + c.island * 1.3) % (Math.PI * 2);
    const r = (isl.rx + isl.ry) * 0.35 + (CRYSTALS.indexOf(c) % 4) * 8;
    return {
      x: isl.cx + Math.cos(angle) * r,
      y: isl.cy + Math.sin(angle) * r * (isl.ry / isl.rx),
    };
  }

  // Precompute positions
  const crystalPositions = CRYSTALS.map(c => crystalPosition(c));

  // ─── Render loop ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let lastFrame = 0;
    const TARGET_FPS = 30;
    const FRAME_TIME = 1000 / TARGET_FPS;
    let playerX = stateRef.current.player.x, playerY = stateRef.current.player.y;

    // Keyboard
    const kd = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const ku = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

    // Touch
    let touchDown = false, touchStartX = 0, touchStartY = 0, touchDX = 0, touchDY = 0;
    const ts = (e: TouchEvent) => { if (e.touches.length === 1) { touchDown = true; touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; } };
    const tm = (e: TouchEvent) => { if (touchDown && e.touches.length === 1) { touchDX = (e.touches[0].clientX - touchStartX) / 30; touchDY = (e.touches[0].clientY - touchStartY) / 30; } };
    const te = () => { touchDown = false; touchDX = 0; touchDY = 0; };
    canvas.addEventListener('touchstart', ts); canvas.addEventListener('touchmove', tm); canvas.addEventListener('touchend', te);

    function render(timestamp: number) {
      animId = requestAnimationFrame(render);
      if (!canvas) return;
      const delta = timestamp - lastFrame;
      if (delta < FRAME_TIME) return; // 30fps cap
      lastFrame = timestamp - (delta % FRAME_TIME);

      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      canvas.width = Math.min(1200, W);
      canvas.height = Math.min(800, H);
      const cw = canvas.width, ch = canvas.height;

      // Camera centered on player
      const camX = playerX - cw * 0.16;
      const camY = playerY - ch * 0.16;

      // ─── Draw map ───
      ctx.fillStyle = '#1a2a44';
      ctx.fillRect(0, 0, cw, ch);

      // Water ripple effect
      const t = timestamp * 0.0003;
      ctx.strokeStyle = 'rgba(50,80,150,0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const wx = (500 - camX) * 0.15 + Math.sin(t + i) * 3;
        const wy = (200 - camY) * 0.15 + Math.cos(t + i) * 3;
        ctx.beginPath(); ctx.arc(wx, wy, 300 + i * 40, 0, Math.PI * 2); ctx.stroke();
      }

      // Islands
      for (const isl of ISLANDS) {
        const ix = isl.cx - camX * 0.15, iy = isl.cy - camY * 0.15;
        const sx = isl.rx * 0.15, sy = isl.ry * 0.15;

        // Shore
        ctx.fillStyle = isl.shoreColor;
        ctx.beginPath(); ctx.ellipse(ix, iy, sx + 4, sy + 4, 0, 0, Math.PI * 2); ctx.fill();

        // Grass
        ctx.fillStyle = isl.color;
        ctx.beginPath(); ctx.ellipse(ix, iy, sx, sy, 0, 0, Math.PI * 2); ctx.fill();

        // Inner highlight
        const grad = ctx.createRadialGradient(ix - sx * 0.2, iy - sy * 0.2, 0, ix, iy, sx);
        grad.addColorStop(0, 'rgba(255,255,255,0.08)');
        grad.addColorStop(1, 'rgba(0,0,0,0.15)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.ellipse(ix, iy, sx, sy, 0, 0, Math.PI * 2); ctx.fill();

        // Island label
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `${Math.max(9, sx * 0.2)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(isl.name, ix, iy - sy * 0.4);

        // Trees (circles)
        const treeCount = Math.floor(sx * sy * 0.005);
        for (let ti = 0; ti < treeCount; ti++) {
          const ta = (ti / treeCount) * Math.PI * 2 + isl.name.length;
          const tr = Math.sqrt(ti / treeCount) * sx * 0.7;
          const tx = ix + Math.cos(ta) * tr, ty = iy + Math.sin(ta) * tr * (sy / sx);
          ctx.fillStyle = '#1a3a1e';
          ctx.beginPath(); ctx.arc(tx, ty, 2 + Math.random() * 1, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Paths between islands
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(180,160,140,0.35)';
      ctx.lineWidth = 1.5;
      [[0, 1], [0, 2], [0, 3]].forEach(([a, b]) => {
        const ia = ISLANDS[a], ib = ISLANDS[b];
        ctx.beginPath();
        ctx.moveTo(ia.cx - camX * 0.15, ia.cy - camY * 0.15);
        ctx.lineTo(ib.cx - camX * 0.15, ib.cy - camY * 0.15);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Crystals
      for (let i = 0; i < CRYSTALS.length; i++) {
        const cp = crystalPositions[i];
        const cx = cp.x - camX * 0.15, cy = cp.y - camY * 0.15;
        const found = sv.crystalsFound.includes(CRYSTALS[i].id);
        const pulse = 1 + Math.sin(timestamp * 0.004 + i) * 0.25;

        // Glow
        ctx.fillStyle = CRYSTALS[i].color.replace(')', ',0.3)').replace('rgb', 'rgba');
        if (CRYSTALS[i].color.startsWith('#')) {
          ctx.fillStyle = CRYSTALS[i].color + '30';
        }
        ctx.beginPath(); ctx.arc(cx, cy, 4 * pulse, 0, Math.PI * 2); ctx.fill();

        // Core
        ctx.fillStyle = found ? CRYSTALS[i].color : '#ffffff80';
        ctx.beginPath(); ctx.arc(cx, cy, 2 * pulse, 0, Math.PI * 2); ctx.fill();

        // Discovered check
        if (found) {
          ctx.fillStyle = '#fff';
          ctx.font = '8px monospace'; ctx.textAlign = 'center';
          ctx.fillText('✓', cx, cy + 3);
        }
      }

      // Chapter markers
      for (const isl of ISLANDS) {
        if (!isl.chapterId) continue;
        const ix = isl.cx - camX * 0.15, iy = isl.cy - camY * 0.15;
        const read = sv.chaptersRead.includes(isl.chapterId!);
        const ch = CHAPTERS.find(c => c.id === isl.chapterId);

        ctx.strokeStyle = ch?.color || '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ix, iy - isl.ry * 0.15 + 2, 6 + Math.sin(timestamp * 0.003) * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = read ? (ch?.color || '#fff') : '#ffffff60';
        ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('📖', ix, iy - isl.ry * 0.15 + 6);
      }

      // ─── Player ───
      const px = playerX - camX * 0.15, py = playerY - camY * 0.15;
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(px, py + 2, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();

      // Body
      ctx.fillStyle = '#8844cc';
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();

      // Hair
      ctx.fillStyle = '#221122';
      ctx.beginPath(); ctx.arc(px, py - 1, 5, Math.PI, Math.PI * 2); ctx.fill();

      // Direction pointer
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py - 7);
      ctx.lineTo(px + 3, py - 3);
      ctx.lineTo(px - 3, py - 3);
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();

      // ─── Movement ───
      const keys = keysRef.current;
      let mx = 0, my = 0;
      const SPD = 2.5;
      if (keys['w'] || keys['arrowup'] || touchDY < -1) my -= SPD;
      if (keys['s'] || keys['arrowdown'] || touchDY > 1) my += SPD;
      if (keys['a'] || keys['arrowleft'] || touchDX < -1) mx -= SPD;
      if (keys['d'] || keys['arrowright'] || touchDX > 1) mx += SPD;

      if (mx !== 0 || my !== 0) {
        const nx = playerX + mx, ny = playerY + my;
        const isl = getIslandForPos(nx, ny);
        if (isl >= 0) {
          playerX = Math.max(100, Math.min(900, nx));
          playerY = Math.max(100, Math.min(900, ny));
          stateRef.current.player.x = playerX;
          stateRef.current.player.y = playerY;
        }

        // Island tracking
        const currentIsland = ISLANDS[isl >= 0 ? isl : 0];
        stateRef.current.player.island = currentIsland.name;
        if (!visitedRef.current.has(currentIsland.name)) {
          visitedRef.current.add(currentIsland.name);
          if (visitedRef.current.size >= 4) unlockAch('explorer');
          if (currentIsland.name === 'Marketing Shores') unlockAch('marketing');
          if (currentIsland.name === 'Tech Peaks') unlockAch('tech');
          if (currentIsland.name === 'AI Valley') unlockAch('ai');
          checkQuests();
        }
      }

      // ─── Nearby detection ───
      let nearby: NearbyInfo | null = null;
      for (let i = 0; i < CRYSTALS.length; i++) {
        const cp = crystalPositions[i];
        const dx = playerX - cp.x, dy = playerY - cp.y;
        if (Math.sqrt(dx * dx + dy * dy) < 15) {
          nearby = { id: CRYSTALS[i].id, title: CRYSTALS[i].title, color: CRYSTALS[i].color, type: 'crystal' };
          break;
        }
      }
      if (!nearby) {
        for (const isl of ISLANDS) {
          if (!isl.chapterId) continue;
          const dx = playerX - isl.cx, dy = playerY - (isl.cy - isl.ry * 0.15);
          if (Math.sqrt(dx * dx + dy * dy) < 18) {
            nearby = { id: isl.chapterId!, title: CHAPTERS.find(c => c.id === isl.chapterId)?.title || '', color: CHAPTERS.find(c => c.id === isl.chapterId)?.color || '#fff', type: 'chapter' };
            break;
          }
        }
      }
      stateRef.current.nearby = nearby;
      stateSnapshotRef.current = { ...stateRef.current };

      // Interaction (E key)
      if (keys['e'] && nearby) {
        keys['e'] = false;
        if (nearby.type === 'crystal') {
          if (!sv.crystalsFound.includes(nearby.id)) {
            sv.crystalsFound.push(nearby.id);
            stateRef.current.crystalsFound = sv.crystalsFound.length;
            addXP(XP_CRYSTAL);
            beep(880, 0.1); setTimeout(() => beep(1100, 0.12), 70);
            if (sv.crystalsFound.length === 1) unlockAch('first_steps');
            if (sv.crystalsFound.length >= TOTAL_CRYSTALS) unlockAch('scholar');
            if (sv.crystalsFound.length >= TOTAL_CRYSTALS && sv.chaptersRead.length >= 4 && sv.achievements.includes('explorer')) unlockAch('master');
            checkQuests();
          }
          onInteract(nearby.id);
        } else if (nearby.type === 'chapter') {
          if (!sv.chaptersRead.includes(nearby.id)) {
            sv.chaptersRead.push(nearby.id);
            stateRef.current.chaptersRead = sv.chaptersRead.length;
            addXP(XP_CHAPTER);
            beep(660, 0.2, 'triangle');
            if (sv.chaptersRead.length >= 4) unlockAch('storyteller');
            checkQuests();
          }
          const story = CHAPTER_STORY[nearby.id];
          if (story) storyRef.current = { title: nearby.title, color: nearby.color, text: story };
        }
      }
    }

    storyDismissRef.current = () => { storyRef.current = null; };

    function resize() {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.min(1200, w);
      canvas.height = Math.min(800, h);
    }
    window.addEventListener('resize', resize);
    resize();
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchstart', ts);
      canvas.removeEventListener('touchmove', tm);
      canvas.removeEventListener('touchend', te);
    };
  }, [onInteract, addXP, unlockAch, checkQuests]);

  return {
    canvasRef,
    get state() { return stateSnapshotRef.current; },
    get showStory() { return storyRef.current; },
    dismissStory: () => storyDismissRef.current(),
    toggleSound: () => {
      sv.soundOn = !sv.soundOn;
      stateRef.current.soundOn = sv.soundOn;
      if (sv.soundOn) { if (!audioCtx) audioCtx = new AudioContext(); audioCtx.resume(); }
      else audioCtx?.suspend();
      save(sv);
    },
    setQuality: (q: number) => { sv.quality = q; stateRef.current.quality = q; save(sv); },
    get lastAchievement() { return achRef.current; },
    get levelUp() { return lvlRef.current; },
  };
}
