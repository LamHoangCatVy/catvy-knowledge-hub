import { useRef, useEffect, type RefObject } from 'react';
import { PROJECTS_DATA } from '../data/projects';
import { CERTS_DATA } from '../data/certifications';
import { COMMUNITY_DATA } from '../data/community';

// ─── Game State Types ───
export interface GameState {
  xp: number; level: number;
  crystalsFound: string[];
  chaptersRead: string[];
  achievements: string[];
  questsCompleted: string[];
  activeQuest: string | null;
  soundEnabled: boolean;
  qualityLevel: number;
}

export interface CrystalNode {
  id: string; title: string; color: string;
  position: { x: number; y: number; z: number };
  group: THREE.Group;
  type: 'proj' | 'cert' | 'comm';
  discovered: boolean;
}

export interface GameEvent {
  type: 'xp' | 'levelup' | 'achievement' | 'quest_complete' | 'quest_progress' | 'crystal_found' | 'chapter_read';
  data?: any;
}

export interface CareerQuestReturn {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  nearbyCrystal: CrystalNode | null;
  playerPosition: { x: number; z: number; island: string };
  gameState: GameState;
  events: GameEvent[];
  mapData: Array<{ x: number; z: number; color: string; found: boolean }>;
  consumeEvent: (index: number) => void;
  setQuality: (l: number) => void;
  toggleSound: () => void;
  introPhase: 'flying' | 'landing' | 'ready';
}

// ─── Constants ───
const SAVE_KEY = 'cv-career-quest';
const TOTAL_CRYSTALS = PROJECTS_DATA.length + CERTS_DATA.length + COMMUNITY_DATA.length;
const TOTAL_CHAPTERS = 4;
const XP_PER_CRYSTAL = 10;
const XP_PER_CHAPTER = 25;
const XP_PER_QUEST = 50;
const XP_PER_LEVEL = 100;

const ACHIEVEMENTS = [
  { id: 'first_steps', name: 'First Steps', desc: 'Discover your first crystal', icon: 'fas fa-gem', color: '#00f3ff' },
  { id: 'explorer', name: 'Explorer', desc: 'Visit all 4 islands', icon: 'fas fa-compass', color: '#00ff88' },
  { id: 'scholar', name: 'Scholar', desc: `Discover ${TOTAL_CRYSTALS} crystals`, icon: 'fas fa-graduation-cap', color: '#ffaa00' },
  { id: 'storyteller', name: 'Storyteller', desc: 'Read all 4 chapters', icon: 'fas fa-book-open', color: '#bc13fe' },
  { id: 'marketing_seed', name: 'Marketing Seed', desc: 'Visit Marketing Shores', icon: 'fas fa-paint-brush', color: '#ffaa00' },
  { id: 'tech_awakening', name: 'Technical Awakening', desc: 'Visit Tech Peaks', icon: 'fas fa-laptop-code', color: '#00f3ff' },
  { id: 'ai_architect', name: 'AI Architect', desc: 'Visit AI Valley', icon: 'fas fa-microchip', color: '#00ff88' },
  { id: 'collector', name: 'Collector', desc: 'Find 18+ crystals', icon: 'fas fa-star', color: '#ff6b6b' },
  { id: 'level_5', name: 'Level 5 Reached', desc: 'Reach level 5', icon: 'fas fa-arrow-up', color: '#ffaa00' },
  { id: 'master', name: 'Career Master', desc: '100% completion', icon: 'fas fa-crown', color: '#ffd700' },
];

const QUESTS = [
  { id: 'q1', title: 'Begin Your Journey', desc: 'Discover your first crystal', target: 1, type: 'crystals' as const },
  { id: 'q2', title: 'Learn the Story', desc: 'Read a chapter sign', target: 1, type: 'chapters' as const },
  { id: 'q3', title: 'Visit AI Valley', desc: 'Travel to the Projects island (northeast)', target: 1, type: 'visit_ai' as const },
  { id: 'q4', title: 'Explore Tech Peaks', desc: 'Travel to the Certs island (northwest)', target: 1, type: 'visit_tech' as const },
  { id: 'q5', title: 'Crystal Hunter', desc: 'Discover 5 crystals', target: 5, type: 'crystals' as const },
  { id: 'q6', title: 'Read Your Story', desc: 'Read 2 chapters', target: 2, type: 'chapters' as const },
  { id: 'q7', title: 'Visit Marketing Shores', desc: 'Travel to the Community island (south)', target: 1, type: 'visit_marketing' as const },
  { id: 'q8', title: 'Halfway There', desc: 'Discover 18 crystals', target: 18, type: 'crystals' as const },
  { id: 'q9', title: 'The Full Story', desc: 'Read all 4 chapters', target: 4, type: 'chapters' as const },
  { id: 'q10', title: 'Master Explorer', desc: 'Discover all 36 crystals', target: TOTAL_CRYSTALS, type: 'crystals' as const },
];

const CHAPTERS_DATA: Array<{ id: string; title: string; position: { x: number; z: number }; color: string }> = [
  { id: 'chapter_1', title: 'The Marketing Seed', position: { x: 6, z: -26 }, color: '#ffaa00' },
  { id: 'chapter_2', title: 'The Technical Awakening', position: { x: -22, z: -13 }, color: '#00f3ff' },
  { id: 'chapter_3', title: 'The AI Architecture', position: { x: 20, z: -15 }, color: '#00ff88' },
  { id: 'chapter_4', title: 'The Open Future', position: { x: 0, z: 2 }, color: '#bc13fe' },
];

// ─── Sound engine ───
class SoundEngine {
  ctx: AudioContext | null = null;
  gain: GainNode | null = null;
  enabled = true;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0.15;
      this.gain.connect(this.ctx.destination);
    } catch { /* noop */ }
  }

  play(freq: number, duration: number, type: OscillatorType = 'sine', rampDown = true) {
    if (!this.enabled || !this.ctx || !this.gain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.3, this.ctx.currentTime);
    if (rampDown) g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.gain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration + 0.1);
  }

  crystalFound() { this.play(880, 0.1); setTimeout(() => this.play(1100, 0.15), 80); }
  chapterRead() { this.play(660, 0.2, 'triangle'); setTimeout(() => this.play(880, 0.3, 'triangle'), 120); }
  achievement() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.2, 'triangle', false), i * 100));
  }
  levelUp() {
    [440, 554, 659, 880, 1100].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'square', false), i * 80));
  }
  ambient() {
    if (!this.enabled || !this.ctx || !this.gain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 60;
    g.gain.value = 0.04;
    osc.connect(g);
    g.connect(this.gain);
    osc.start();
    return osc;
  }
}

// ─── Save/Load ───
function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { xp: 0, level: 1, crystalsFound: [], chaptersRead: [], achievements: [], questsCompleted: [], activeQuest: 'q1', soundEnabled: false, qualityLevel: 1 };
}

function saveGame(state: GameState) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* noop */ }
}

// ─── Quality detection ───
function detectQuality(): number {
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
  if (isMobile || window.innerWidth < 768) return 0;
  if ((window.devicePixelRatio || 1) <= 1.5) return 1;
  return 2;
}

// ─── Terrain ───
function islandHeight(x: number, z: number): number {
  let h = 0;
  h += 7 * Math.exp(-(x * x + (z - 2) * (z - 2)) / 100);
  h += 5 * Math.exp(-((x - 20) * (x - 20) + (z + 15) * (z + 15)) / 160);
  h += 5 * Math.exp(-((x + 20) * (x + 20) + (z + 15) * (z + 15)) / 160);
  h += 5 * Math.exp(-((x - 6) * (x - 6) + (z + 26) * (z + 26)) / 140);
  return h;
}

function getZoneName(px: number, pz: number): string {
  const d = [
    { name: 'The Hub', dist: Math.sqrt(px * px + (pz - 2) * (pz - 2)) },
    { name: 'AI Valley', dist: Math.sqrt((px - 20) ** 2 + (pz + 15) ** 2) },
    { name: 'Tech Peaks', dist: Math.sqrt((px + 20) ** 2 + (pz + 15) ** 2) },
    { name: 'Marketing Shores', dist: Math.sqrt((px - 6) ** 2 + (pz + 26) ** 2) },
  ];
  return d.reduce((a, b) => (b.dist < a.dist ? b : a)).name;
}

// ─── Main Hook ───
export function useCareerQuest(
  stateRef: RefObject<{ mode: string; activeNode: string | null }>,
  onInteract: (nodeId: string) => void
): CareerQuestReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerPosRef = useRef({ x: 0, z: 5, island: 'The Hub' });
  const nearbyRef = useRef<CrystalNode | null>(null);
  const eventsRef = useRef<GameEvent[]>([]);
  const gameStateRef = useRef<GameState>(loadGame());
  const soundRef = useRef(new SoundEngine());
  const qualityUpdateRef = useRef<((l: number) => void) | null>(null);
  const introPhaseRef = useRef<'flying' | 'landing' | 'ready'>('flying');
  const visitedIslandsRef = useRef<Set<string>>(new Set());
  const crystalsRef = useRef<CrystalNode[]>([]);
  const mapDataRef = useRef<Array<{ x: number; z: number; color: string; found: boolean }>>([]);

  // Track island visits for achievements
  function trackIsland(zone: string) {
    const gs = gameStateRef.current;
    if (!visitedIslandsRef.current.has(zone)) {
      visitedIslandsRef.current.add(zone);
      if (visitedIslandsRef.current.size >= 4 && !gs.achievements.includes('explorer')) {
        unlockAchievement('explorer');
      }
      if (zone === 'Marketing Shores' && !gs.achievements.includes('marketing_seed')) unlockAchievement('marketing_seed');
      if (zone === 'Tech Peaks' && !gs.achievements.includes('tech_awakening')) unlockAchievement('tech_awakening');
      if (zone === 'AI Valley' && !gs.achievements.includes('ai_architect')) unlockAchievement('ai_architect');
    }
  }

  function addXP(amount: number) {
    const gs = gameStateRef.current;
    gs.xp += amount;
    eventsRef.current.push({ type: 'xp', data: { amount, total: gs.xp } });

    const newLevel = Math.floor(gs.xp / XP_PER_LEVEL) + 1;
    if (newLevel > gs.level) {
      gs.level = newLevel;
      eventsRef.current.push({ type: 'levelup', data: { level: newLevel } });
      soundRef.current.levelUp();
      if (newLevel >= 5 && !gs.achievements.includes('level_5')) unlockAchievement('level_5');
    }
    saveGame(gs);
  }

  function addCrystal(nodeId: string) {
    const gs = gameStateRef.current;
    if (gs.crystalsFound.includes(nodeId)) return;
    gs.crystalsFound.push(nodeId);
    addXP(XP_PER_CRYSTAL);
    soundRef.current.crystalFound();
    eventsRef.current.push({ type: 'crystal_found', data: { id: nodeId, total: gs.crystalsFound.length } });

    const crystal = crystalsRef.current.find(c => c.id === nodeId);
    if (crystal) crystal.discovered = true;

    if (gs.crystalsFound.length === 1 && !gs.achievements.includes('first_steps')) unlockAchievement('first_steps');
    if (gs.crystalsFound.length >= 18 && !gs.achievements.includes('collector')) unlockAchievement('collector');
    if (gs.crystalsFound.length >= TOTAL_CRYSTALS && !gs.achievements.includes('scholar')) unlockAchievement('scholar');
    if (gs.crystalsFound.length >= TOTAL_CRYSTALS && gs.chaptersRead.length >= TOTAL_CHAPTERS && gs.achievements.includes('explorer')) {
      if (!gs.achievements.includes('master')) unlockAchievement('master');
    }
    checkQuests();
    saveGame(gs);
  }

  function addChapter(chapterId: string) {
    const gs = gameStateRef.current;
    if (gs.chaptersRead.includes(chapterId)) return;
    gs.chaptersRead.push(chapterId);
    addXP(XP_PER_CHAPTER);
    soundRef.current.chapterRead();
    eventsRef.current.push({ type: 'chapter_read', data: { id: chapterId } });
    if (gs.chaptersRead.length >= 4 && !gs.achievements.includes('storyteller')) unlockAchievement('storyteller');
    checkQuests();
    saveGame(gs);
  }

  function unlockAchievement(id: string) {
    const gs = gameStateRef.current;
    if (gs.achievements.includes(id)) return;
    gs.achievements.push(id);
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    eventsRef.current.push({ type: 'achievement', data: ach });
    soundRef.current.achievement();
    saveGame(gs);
  }

  function checkQuests() {
    const gs = gameStateRef.current;
    for (const quest of QUESTS) {
      if (gs.questsCompleted.includes(quest.id)) continue;
      let progress = 0;
      if (quest.type === 'crystals') progress = gs.crystalsFound.length;
      else if (quest.type === 'chapters') progress = gs.chaptersRead.length;
      else if (quest.type === 'visit_ai') progress = visitedIslandsRef.current.has('AI Valley') ? 1 : 0;
      else if (quest.type === 'visit_tech') progress = visitedIslandsRef.current.has('Tech Peaks') ? 1 : 0;
      else if (quest.type === 'visit_marketing') progress = visitedIslandsRef.current.has('Marketing Shores') ? 1 : 0;

      if (progress >= quest.target) {
        gs.questsCompleted.push(quest.id);
        addXP(XP_PER_QUEST);
        eventsRef.current.push({ type: 'quest_complete', data: quest });
        // Set next quest
        const nextIdx = QUESTS.findIndex(q => q.id === quest.id) + 1;
        if (nextIdx < QUESTS.length && !gs.questsCompleted.includes(QUESTS[nextIdx].id)) {
          gs.activeQuest = QUESTS[nextIdx].id;
        }
        saveGame(gs);
      } else if (gs.activeQuest === quest.id && progress > 0) {
        eventsRef.current.push({ type: 'quest_progress', data: { ...quest, progress } });
      }
    }
  }

  // ─── Effect: Initialize scene ───
  const firstLoad = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.THREE) return;
    if (!firstLoad.current) return;
    firstLoad.current = false;

    const THREE = window.THREE;
    const gs = gameStateRef.current;
    const sound = soundRef.current;
    gs.qualityLevel = detectQuality();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.FogExp2(0x1a1a2e, 0.0005);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 200);
    camera.position.set(0, 40, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: gs.qualityLevel > 0, alpha: false, powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, gs.qualityLevel > 0 ? 1.5 : 1));
    renderer.sortObjects = false;

    // Lights
    scene.add(new THREE.AmbientLight(0x334466, 2.2));
    const sun = new THREE.DirectionalLight(0xffeedd, 2.5);
    sun.position.set(30, 40, 20);
    scene.add(sun);

    // Water
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshToonMaterial({ color: 0x2244aa }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.3;
    water.renderOrder = 999;
    scene.add(water);

    // Terrain
    const SEG = gs.qualityLevel === 0 ? 30 : gs.qualityLevel === 1 ? 50 : 60;
    const terrainGeo = new THREE.PlaneGeometry(100, 100, SEG, SEG);
    terrainGeo.rotateX(-Math.PI / 2);
    const tPos = terrainGeo.attributes.position.array as Float32Array;
    const tCol = new Float32Array(tPos.length);
    for (let i = 0; i < tPos.length; i += 3) {
      const x = tPos[i], z = tPos[i + 2], h = islandHeight(x, z);
      tPos[i + 1] = h;
      tCol[i] = 0.18 + Math.min(1, h / 7) * 0.15;
      tCol[i + 1] = 0.38 + Math.min(1, h / 7) * 0.15;
      tCol[i + 2] = 0.12 + Math.min(1, h / 7) * 0.08;
    }
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3));
    terrainGeo.computeVertexNormals();
    scene.add(new THREE.Mesh(terrainGeo, new THREE.MeshToonMaterial({ vertexColors: true })));

    // Trees
    const treeCount = gs.qualityLevel === 0 ? 20 : gs.qualityLevel === 1 ? 50 : 80;
    const treeGrp = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.2, 0.8, 4);
    const trunkMat = new THREE.MeshToonMaterial({ color: 0x5c3a21 });
    const leafGeo = new THREE.ConeGeometry(0.4, 0.7, 6);
    const leafMats = [new THREE.MeshToonMaterial({ color: 0x2d5a1e }), new THREE.MeshToonMaterial({ color: 0x3a7a2a })];
    for (let i = 0; i < treeCount; i++) {
      const tx = (Math.random() - 0.5) * 75, tz = (Math.random() - 0.5) * 75, th = islandHeight(tx, tz);
      if (th < 1 || th > 6.5) continue;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat); trunk.position.y = 0.4; tree.add(trunk);
      const leaves = 1 + Math.floor(Math.random() * 2);
      for (let l = 0; l < leaves; l++) {
        const leaf = new THREE.Mesh(leafGeo, leafMats[Math.floor(Math.random() * 2)]);
        leaf.position.y = 0.8 + l * 0.5; leaf.rotation.y = Math.random() * Math.PI; tree.add(leaf);
      }
      tree.position.set(tx, th, tz); tree.scale.setScalar(0.6 + Math.random() * 0.6);
      treeGrp.add(tree);
    }
    scene.add(treeGrp);

    // Paths
    [[0, 2, 20, -15], [0, 2, -20, -15], [0, 2, 6, -26]].forEach(([sx, sz, ex, ez]) => {
      const dx = ex - sx, dz = ez - sz, len = Math.sqrt(dx * dx + dz * dz);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(1, len), new THREE.MeshToonMaterial({ color: 0x665544 }));
      p.rotation.x = -Math.PI / 2; p.rotation.z = Math.atan2(dx, dz);
      p.position.set((sx + ex) / 2, 0.05, (sz + ez) / 2); scene.add(p);
    });

    // Crystals
    const crystals: CrystalNode[] = [];
    const mapData: Array<{ x: number; z: number; color: string; found: boolean }> = [];

    function placeCrystal(id: string, x: number, z: number, col: string, type: 'proj' | 'cert' | 'comm', title: string) {
      const h = islandHeight(x, z), y = h + 1.5;
      const hex = parseInt(col.replace('#', '0x'));
      const grp = new THREE.Group(); grp.position.set(x, y, z);
      grp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.3, 6), new THREE.MeshToonMaterial({ color: 0x333333 })));
      grp.children[0].position.y = -1.5;
      grp.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), new THREE.MeshToonMaterial({ color: hex })));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.03, 6, 12), new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.5 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = -0.1; grp.add(ring);
      scene.add(grp);

      const discovered = gameStateRef.current.crystalsFound.includes(id);
      const crystal: CrystalNode = { id, title, color: col, position: { x, y, z }, group: grp, type, discovered };
      crystals.push(crystal);
      mapData.push({ x, z, color: col, found: discovered });
    }

    PROJECTS_DATA.forEach((p, i) => {
      const a = (i / PROJECTS_DATA.length) * Math.PI * 2, r = 4 + (i % 3) * 2.5;
      placeCrystal(p.id, 20 + Math.cos(a) * r, -15 + Math.sin(a) * r, '#00ff88', 'proj', p.title);
    });
    CERTS_DATA.forEach((c, i) => {
      const a = (i / CERTS_DATA.length) * Math.PI * 2, r = 3.5 + (i % 2) * 2;
      placeCrystal(c.id, -20 + Math.cos(a) * r, -15 + Math.sin(a) * r, '#ffaa00', 'cert', c.title);
    });
    COMMUNITY_DATA.forEach((c, i) => {
      const a = (i / COMMUNITY_DATA.length) * Math.PI * 2, r = 3.5 + (i % 2) * 2;
      placeCrystal(c.id, 6 + Math.cos(a) * r, -26 + Math.sin(a) * r, '#ff0055', 'comm', c.title);
    });

    crystalsRef.current = crystals;
    mapDataRef.current = mapData;

    // Chapter signs
    CHAPTERS_DATA.forEach(ch => {
      const h = islandHeight(ch.position.x, ch.position.z) + 1.5;
      const hex = parseInt(ch.color.replace('#', '0x'));
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 3, 6), new THREE.MeshToonMaterial({ color: 0x553311 }));
      post.position.set(ch.position.x, h + 1.5, ch.position.z); scene.add(post);
      const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 0.1), new THREE.MeshToonMaterial({ color: hex }));
      board.position.set(ch.position.x, h + 3.1, ch.position.z);
      board.userData = { chapterId: ch.id, chapterTitle: ch.title }; scene.add(board);
    });

    // Sparkles
    const spCount = gs.qualityLevel === 0 ? 30 : gs.qualityLevel === 1 ? 80 : 150;
    const spPos = new Float32Array(spCount * 3), spBase = new Float32Array(spCount);
    for (let i = 0; i < spCount; i++) { spPos[i * 3] = (Math.random() - 0.5) * 60; spPos[i * 3 + 1] = 2 + Math.random() * 15; spPos[i * 3 + 2] = (Math.random() - 0.5) * 60; spBase[i] = spPos[i * 3 + 1]; }
    const spGeo = new THREE.BufferGeometry(); spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
    const spPts = new THREE.Points(spGeo, new THREE.PointsMaterial({ size: 0.06, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.4 }));
    scene.add(spPts);

    // Vy character
    const vy = new THREE.Group();
    const dMat = new THREE.MeshToonMaterial({ color: 0x8844cc }), sMat = new THREE.MeshToonMaterial({ color: 0xffcc99 }), hMat = new THREE.MeshToonMaterial({ color: 0x221122 });
    vy.add(m(new THREE.CylinderGeometry(0.3, 0.45, 1.2, 6), dMat, 0, 0.6, 0));
    vy.add(m(new THREE.SphereGeometry(0.28, 6, 5), sMat, 0, 1.4, 0));
    vy.add(m(new THREE.SphereGeometry(0.3, 6, 5, 0, Math.PI * 2, 0, Math.PI * 0.6), hMat, 0, 1.45, 0));
    vy.add(m(new THREE.ConeGeometry(0.12, 0.4, 5), hMat, 0, 1.55, -0.18));
    vy.add(m(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 5), sMat, -0.14, 0.22, 0));
    vy.add(m(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 5), sMat, 0.14, 0.22, 0));
    vy.position.set(0, 0, 5); scene.add(vy);

    function m(geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) {
      const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); return mesh;
    }

    // Input
    const keys: Record<string, boolean> = {};
    window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

    let touchActive = false, touchSX = 0, touchSY = 0, touchMX = 0, touchMY = 0;
    canvas.addEventListener('touchstart', e => { if (e.touches.length === 1) { touchActive = true; touchSX = e.touches[0].clientX; touchSY = e.touches[0].clientY; } e.preventDefault(); });
    canvas.addEventListener('touchmove', e => { if (touchActive && e.touches.length === 1) { touchMX = (e.touches[0].clientX - touchSX) / 40; touchMY = (e.touches[0].clientY - touchSY) / 40; } e.preventDefault(); });
    canvas.addEventListener('touchend', () => { touchActive = false; touchMX = 0; touchMY = 0; });

    let camAngle = 0, camPitch = 0.5, CAM_DIST = 8;
    canvas.addEventListener('click', () => { if (document.pointerLockElement !== canvas) canvas.requestPointerLock(); });
    document.addEventListener('mousemove', e => {
      if (document.pointerLockElement === canvas) {
        camAngle += e.movementX * 0.003;
        camPitch = Math.max(0.1, Math.min(1.2, camPitch - e.movementY * 0.003));
      }
    });

    // Quality update
    qualityUpdateRef.current = (l: number) => {
      gs.qualityLevel = l;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, l > 0 ? 1.5 : 1));
      saveGame(gs);
    };

    // Ambient
    const ambientOsc = sound.ambient();

    // Intro timer
    setTimeout(() => { introPhaseRef.current = 'landing'; }, 3000);
    setTimeout(() => { introPhaseRef.current = 'ready'; }, 5000);

    // Animation
    let reqId: number;
    const clock = new THREE.Clock();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();

    function animate() {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const state = stateRef.current;

      if (state.mode === 'ADVENTURE') {
        const intro = introPhaseRef.current;

        if (intro === 'flying') {
          const t = Date.now() * 0.0005;
          camera.position.lerp(new THREE.Vector3(Math.sin(t) * 30, 25, Math.cos(t) * 30), 0.02);
          camera.lookAt(0, 0, 0);
        } else if (intro === 'landing') {
          const cx = vy.position.x, cz = vy.position.z;
          camera.position.lerp(new THREE.Vector3(cx + 3, 12, cz + 10), 0.03);
          camera.lookAt(cx, 0, cz);
        } else {
          // Movement
          const speed = 7;
          const fwd = new THREE.Vector3(-Math.sin(camAngle), 0, -Math.cos(camAngle));
          const rgt = new THREE.Vector3(Math.cos(camAngle), 0, -Math.sin(camAngle));
          const move = new THREE.Vector3();
          if (keys['w'] || keys['arrowup'] || touchMY < -0.3) move.add(fwd);
          if (keys['s'] || keys['arrowdown'] || touchMY > 0.3) move.sub(fwd);
          if (keys['a'] || keys['arrowleft'] || touchMX < -0.3) move.sub(rgt);
          if (keys['d'] || keys['arrowright'] || touchMX > 0.3) move.add(rgt);

          if (move.length() > 0) {
            move.normalize().multiplyScalar(speed * dt);
            const nx = Math.max(-45, Math.min(45, vy.position.x + move.x));
            const nz = Math.max(-45, Math.min(45, vy.position.z + move.z));
            const gh = islandHeight(nx, nz);
            if (gh > 0.3) { vy.position.x = nx; vy.position.z = nz; vy.position.y = gh; }
            const ma = Math.atan2(move.x, move.z);
            euler.set(0, vy.rotation.y + (ma - vy.rotation.y) * 0.15, 0);
            quaternion.setFromEuler(euler);
            vy.quaternion.slerp(quaternion, 0.2);
            vy.position.y += Math.sin(Date.now() * 0.01) * 0.06;
          } else {
            vy.position.y += Math.sin(Date.now() * 0.005) * 0.02;
          }

          // Camera
          const cx = vy.position.x + Math.sin(camAngle) * CAM_DIST * Math.cos(camPitch);
          const cy = vy.position.y + CAM_DIST * Math.sin(camPitch) + 2.5;
          const cz = vy.position.z + Math.cos(camAngle) * CAM_DIST * Math.cos(camPitch);
          camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.1);
          camera.lookAt(vy.position.x, vy.position.y + 1.1, vy.position.z);

          // Detect nearby crystal
          let best: CrystalNode | null = null, bestD = 3;
          for (const c of crystals) {
            const d = Math.sqrt((vy.position.x - c.position.x) ** 2 + (vy.position.z - c.position.z) ** 2);
            if (d < bestD) { bestD = d; best = c; }
          }
          nearbyRef.current = best;

          // Zone + island tracking
          const zone = getZoneName(vy.position.x, vy.position.z);
          playerPosRef.current = { x: vy.position.x, z: vy.position.z, island: zone };
          trackIsland(zone);

          // Chapter detection
          for (const ch of CHAPTERS_DATA) {
            const d = Math.sqrt((vy.position.x - ch.position.x) ** 2 + (vy.position.z - ch.position.z) ** 2);
            if (d < 3.5) addChapter(ch.id);
          }

          // Interact
          if ((keys['e'] || (touchActive && best)) && best && !state.activeNode) {
            addCrystal(best.id);
            onInteract(best.id);
            keys['e'] = false;
          }
        }
      } else {
        const t = Date.now() * 0.0003;
        camera.position.lerp(new THREE.Vector3(Math.sin(t) * 40, 30, Math.cos(t) * 40), 0.03);
        camera.lookAt(0, 0, 0);
      }

      // Animate crystals
      crystals.forEach((c, i) => {
        c.group.position.y = c.position.y + Math.sin(Date.now() * 0.003 + i) * 0.25;
        c.group.children[1].rotation.y += 0.02;
        // Found crystals glow brighter
        if (c.discovered) {
          const child = c.group.children[2] as THREE.Mesh;
          (child.material as THREE.MeshBasicMaterial).opacity = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
        }
      });

      const sp = spPts.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < spCount; i++) sp[i * 3 + 1] = spBase[i] + Math.sin(Date.now() * 0.002 + i) * 2;
      spPts.geometry.attributes.position.needsUpdate = true;
      water.position.y = -0.3 + Math.sin(Date.now() * 0.001) * 0.08;
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Save periodically
    const saveInterval = setInterval(() => saveGame(gameStateRef.current), 10000);

    return () => {
      cancelAnimationFrame(reqId);
      clearInterval(saveInterval);
      window.removeEventListener('resize', onResize);
      if (ambientOsc) ambientOsc.stop();
      renderer.dispose(); scene.clear();
    };
  }, []);

  return {
    canvasRef,
    get nearbyCrystal() { return nearbyRef.current; },
    get playerPosition() { return playerPosRef.current; },
    get gameState() { return gameStateRef.current; },
    get events() { return eventsRef.current; },
    get mapData() { return mapDataRef.current; },
    consumeEvent: (i: number) => { eventsRef.current.splice(i, 1); },
    setQuality: (l: number) => { qualityUpdateRef.current?.(l); gameStateRef.current.qualityLevel = l; saveGame(gameStateRef.current); },
    toggleSound: () => {
      const s = soundRef.current;
      s.enabled = !s.enabled;
      gameStateRef.current.soundEnabled = s.enabled;
      if (s.enabled) s.init();
      saveGame(gameStateRef.current);
    },
    get introPhase() { return introPhaseRef.current; },
  };
}
