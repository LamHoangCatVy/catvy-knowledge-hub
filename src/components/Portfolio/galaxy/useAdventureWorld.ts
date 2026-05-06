import { useRef, useEffect, type RefObject } from 'react';
import { PROJECTS_DATA } from '../data/projects';
import { CERTS_DATA } from '../data/certifications';
import { COMMUNITY_DATA } from '../data/community';

// ─── Quality auto-detection ───
function detectQuality(): { level: number; shadows: boolean; trees: number; particles: number; segments: number } {
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
  const isSmallScreen = window.innerWidth < 768;
  const pixelRatio = window.devicePixelRatio || 1;

  if (isMobile || isSmallScreen || pixelRatio <= 1) {
    return { level: 0, shadows: false, trees: 20, particles: 30, segments: 30 };
  }
  if (pixelRatio <= 1.5) {
    return { level: 1, shadows: false, trees: 50, particles: 80, segments: 50 };
  }
  return { level: 2, shadows: true, trees: 80, particles: 150, segments: 60 };
}

// ─── Story chapters ───
interface StoryChapter {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  position: { x: number; z: number };
  color: string;
  paragraphs: string[];
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 'chapter_1',
    title: 'The Marketing Seed',
    subtitle: 'Graphic Designer · NGO Volunteer',
    year: '2016 – 2019',
    position: { x: 6, z: -26 },
    color: '#ffaa00',
    paragraphs: [
      'Vy started as a graphic designer for The Middle Man NGO, crafting visual stories that connected with young audiences. She learned that communication — not just technology — is the foundation of impact.',
      'As Head of Marketing for The Patronous, she built an ecosystem helping teenagers overcome challenges. From 0 to 5K+ followers, she discovered her talent for bridging communities with ideas.',
    ],
  },
  {
    id: 'chapter_2',
    title: 'The Technical Awakening',
    subtitle: 'Cloud Engineer · Pre-Sales Architect',
    year: '2019 – 2023',
    position: { x: -22, z: -13 },
    color: '#00f3ff',
    paragraphs: [
      'The pivot came when Vy realized technology could scale her impact beyond any single community. She dove into cloud computing, earning AWS certifications while designing PoCs that won international telecom contracts.',
      'At Cloud Kinetics, she drafted SOWs for Softel US/VN, designed AWS Landing Zones for e-commerce migrations, and learned to translate business requirements into technical architecture.',
    ],
  },
  {
    id: 'chapter_3',
    title: 'The AI Architecture',
    subtitle: 'Senior Systems Analyst · my company',
    year: '2024 – Present',
    position: { x: 20, z: -15 },
    color: '#00ff88',
    paragraphs: [
      'At my company, Vy found her calling — architecting Generative AI systems that serve thousands of employees. ezPolicy transformed policy search from <20% to >90% accuracy. The AML Chatbot delivers 93%+ query relevance.',
      'She designed the ezGenAI foundation platform supporting 100+ AI use cases bankwide, built the Prompt Security Gate achieving 100% compliance, and created the IT Young Talents 4-step funnel.',
    ],
  },
  {
    id: 'chapter_4',
    title: 'The Open Future',
    subtitle: 'Community Builder · Open Source Creator',
    year: 'Now & Beyond',
    position: { x: 0, z: 2 },
    color: '#bc13fe',
    paragraphs: [
      'Every crystal you discover is a real project, certification, or community contribution. Walk the islands, explore the achievements, and see how one person — starting from graphic design — built an AI architecture career.',
      'The journey continues. yummy, the open-source multi-agent platform, invites anyone to build AI agents. The AWS Community Builder connects 50K+ engineers worldwide. Vy\'s story proves that non-linear paths create the most interesting architects.',
    ],
  },
];

// ─── Interfaces ───
interface AdventureNode {
  id: string;
  title: string;
  color: string;
  position: { x: number; y: number; z: number };
  group: THREE.Group;
  type: 'proj' | 'cert' | 'comm';
}

interface AdventureState {
  mode: string;
  activeNode: string | null;
}

export interface AdventureWorldReturn {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  nearbyNode: AdventureNode | null;
  playerPosition: { x: number; z: number; islands: string };
  qualityLevel: number;
  activeChapter: string | null;
  setQualityLevel: (level: number) => void;
}

// ─── Main hook ───
export function useAdventureWorld(
  stateRef: RefObject<AdventureState>,
  onInteract: (nodeId: string) => void
): AdventureWorldReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerPosRef = useRef({ x: 0, z: 5 });
  const nearbyNodeRef = useRef<AdventureNode | null>(null);
  const zoneRef = useRef('Hub');
  const qualityRef = useRef(detectQuality());
  const activeChapterRef = useRef<string | null>(null);
  const qualityUpdateRef = useRef<((level: number) => void) | null>(null);

  const setQualityLevel = (level: number) => {
    qualityUpdateRef.current?.(level);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.THREE) return;

    const THREE = window.THREE;
    const q = qualityRef.current;

    // ─── Scene ───
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.FogExp2(0x1a1a2e, 0.0006);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 200);
    camera.position.set(0, 20, 18);
    camera.lookAt(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: q.level > 0, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.level > 0 ? 1.5 : 1));
    renderer.sortObjects = false;

    if (q.shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // ─── Lights ───
    scene.add(new THREE.AmbientLight(0x334466, 2.0));
    const sun = new THREE.DirectionalLight(0xffeedd, 2.5);
    sun.position.set(30, 40, 20);
    if (q.shadows) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(256, 256);
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 100;
      sun.shadow.camera.left = -40; sun.shadow.camera.right = 40;
      sun.shadow.camera.top = 40; sun.shadow.camera.bottom = -40;
    }
    scene.add(sun);

    // ─── Water ───
    const waterGeo = new THREE.PlaneGeometry(120, 120);
    const waterMat = new THREE.MeshToonMaterial({ color: 0x2244aa });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.3;
    water.renderOrder = 999;
    scene.add(water);

    // ─── Terrain (reduced segments) ───
    const SIZE = 100;
    const SEG = q.segments;
    const terrainGeo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    terrainGeo.rotateX(-Math.PI / 2);
    const tPos = terrainGeo.attributes.position.array as Float32Array;
    const tCol = new Float32Array(tPos.length);

    function islandH(x: number, z: number): number {
      let h = 0;
      h += 7 * Math.exp(-(x * x + (z - 2) * (z - 2)) / 100);
      h += 5 * Math.exp(-((x - 20) * (x - 20) + (z + 15) * (z + 15)) / 160);
      h += 5 * Math.exp(-((x + 20) * (x + 20) + (z + 15) * (z + 15)) / 160);
      h += 5 * Math.exp(-((x - 6) * (x - 6) + (z + 26) * (z + 26)) / 140);
      return h;
    }

    for (let i = 0; i < tPos.length; i += 3) {
      const x = tPos[i], z = tPos[i + 2];
      const h = islandH(x, z);
      tPos[i + 1] = h;
      const t = Math.max(0, Math.min(1, h / 7));
      tCol[i] = 0.18 + t * 0.15;
      tCol[i + 1] = 0.38 + t * 0.15;
      tCol[i + 2] = 0.12 + t * 0.08;
    }

    terrainGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3));
    terrainGeo.computeVertexNormals();

    const terrainMesh = new THREE.Mesh(terrainGeo, new THREE.MeshToonMaterial({ vertexColors: true }));
    scene.add(terrainMesh);

    // ─── Trees (instanced for performance) ───
    const treeGroup = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.2, 0.8, 4);
    const trunkBaseMat = new THREE.MeshToonMaterial({ color: 0x5c3a21 });

    const leafGeo = new THREE.ConeGeometry(0.4, 0.7, 6);
    const leafMats = [
      new THREE.MeshToonMaterial({ color: 0x2d5a1e }),
      new THREE.MeshToonMaterial({ color: 0x3a7a2a }),
    ];

    let treeCount = 0;
    for (let i = 0; i < q.trees; i++) {
      const tx = (Math.random() - 0.5) * 75;
      const tz = (Math.random() - 0.5) * 75;
      const th = islandH(tx, tz);
      if (th < 1 || th > 6.5) continue;

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkBaseMat);
      trunk.position.y = 0.4;
      tree.add(trunk);

      const leaves = Math.floor(1 + Math.random() * 2);
      for (let l = 0; l < leaves; l++) {
        const leaf = new THREE.Mesh(leafGeo, leafMats[Math.floor(Math.random() * 2)]);
        leaf.position.y = 0.8 + l * 0.5;
        leaf.rotation.y = Math.random() * Math.PI;
        tree.add(leaf);
      }

      tree.position.set(tx, th, tz);
      const s = 0.6 + Math.random() * 0.6;
      tree.scale.setScalar(s);
      treeGroup.add(tree);
      treeCount++;
    }
    scene.add(treeGroup);

    // ─── Paths ───
    const pathPoints: Array<{ sx: number; sz: number; ex: number; ez: number }> = [
      { sx: 0, sz: 2, ex: 20, ez: -15 },
      { sx: 0, sz: 2, ex: -20, ez: -15 },
      { sx: 0, sz: 2, ex: 6, ez: -26 },
    ];
    pathPoints.forEach(({ sx, sz, ex, ez }) => {
      const dx = ex - sx, dz = ez - sz;
      const len = Math.sqrt(dx * dx + dz * dz);
      const pathGeo = new THREE.PlaneGeometry(1, len);
      const pathMesh = new THREE.Mesh(pathGeo, new THREE.MeshToonMaterial({ color: 0x665544 }));
      pathMesh.rotation.x = -Math.PI / 2;
      pathMesh.rotation.z = Math.atan2(dx, dz);
      pathMesh.position.set((sx + ex) / 2, 0.05, (sz + ez) / 2);
      scene.add(pathMesh);
    });

    // ─── Island node markers ───
    const interactables: AdventureNode[] = [];

    function placeNode(id: string, x: number, z: number, col: string, type: 'proj' | 'cert' | 'comm', title: string) {
      const h = islandH(x, z);
      const y = h + 1.5;
      const hex = parseInt(col.replace('#', '0x'));

      const grp = new THREE.Group();
      grp.position.set(x, y, z);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.3, 6), new THREE.MeshToonMaterial({ color: 0x333333 }));
      base.position.y = -1.5;
      grp.add(base);

      const crys = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), new THREE.MeshToonMaterial({ color: hex }));
      grp.add(crys);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.03, 6, 12), new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.5 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.1;
      grp.add(ring);

      scene.add(grp);
      interactables.push({ id, title, color: col, position: { x, y, z }, group: grp, type });
    }

    PROJECTS_DATA.forEach((p, i) => {
      const a = (i / PROJECTS_DATA.length) * Math.PI * 2;
      const r = 4 + (i % 3) * 2.5;
      placeNode(p.id, 20 + Math.cos(a) * r, -15 + Math.sin(a) * r, '#00ff88', 'proj', p.title);
    });

    CERTS_DATA.forEach((c, i) => {
      const a = (i / CERTS_DATA.length) * Math.PI * 2;
      const r = 3.5 + (i % 2) * 2;
      placeNode(c.id, -20 + Math.cos(a) * r, -15 + Math.sin(a) * r, '#ffaa00', 'cert', c.title);
    });

    COMMUNITY_DATA.forEach((c, i) => {
      const a = (i / COMMUNITY_DATA.length) * Math.PI * 2;
      const r = 3.5 + (i % 2) * 2;
      placeNode(c.id, 6 + Math.cos(a) * r, -26 + Math.sin(a) * r, '#ff0055', 'comm', c.title);
    });

    // ─── Story chapter signs ───
    CHAPTERS.forEach((ch) => {
      const h = islandH(ch.position.x, ch.position.z) + 1.5;
      const hex = parseInt(ch.color.replace('#', '0x'));

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 3, 6),
        new THREE.MeshToonMaterial({ color: 0x553311 })
      );
      post.position.set(ch.position.x, h + 1.5, ch.position.z);
      post.name = `sign-${ch.id}`;
      scene.add(post);

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.7, 0.1),
        new THREE.MeshToonMaterial({ color: hex })
      );
      board.position.set(ch.position.x, h + 3.1, ch.position.z);
      board.name = `sign-board-${ch.id}`;
      board.userData = { chapterId: ch.id, chapterTitle: ch.title };
      scene.add(board);
    });

    // ─── Sparkles (reduced) ───
    const sparkleCount = q.particles;
    const sparklePos = new Float32Array(sparkleCount * 3);
    const sparkleBase = new Float32Array(sparkleCount);
    for (let i = 0; i < sparkleCount; i++) {
      sparklePos[i * 3] = (Math.random() - 0.5) * 60;
      sparklePos[i * 3 + 1] = 2 + Math.random() * 15;
      sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 60;
      sparkleBase[i] = sparklePos[i * 3 + 1];
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    const sparkPts = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
      size: 0.06, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.4,
    }));
    scene.add(sparkPts);

    // ─── Vy (simplified) ───
    const vy = new THREE.Group();
    const dressMat = new THREE.MeshToonMaterial({ color: 0x8844cc });
    const skinMat = new THREE.MeshToonMaterial({ color: 0xffcc99 });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x221122 });

    vy.add(makePart(new THREE.CylinderGeometry(0.3, 0.45, 1.2, 6), dressMat, 0, 0.6, 0));
    vy.add(makePart(new THREE.SphereGeometry(0.28, 6, 5), skinMat, 0, 1.4, 0));
    vy.add(makePart(new THREE.SphereGeometry(0.3, 6, 5, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat, 0, 1.45, 0));
    vy.add(makePart(new THREE.ConeGeometry(0.12, 0.4, 5), hairMat, 0, 1.55, -0.18));
    vy.add(makePart(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 5), skinMat, -0.14, 0.22, 0));
    vy.add(makePart(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 5), skinMat, 0.14, 0.22, 0));
    vy.position.set(0, 0, 5);
    scene.add(vy);

    function makePart(geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      return m;
    }

    // ─── Input ───
    const keys: Record<string, boolean> = {};
    window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

    // ─── Touch controls ───
    let touchActive = false;
    let touchStartX = 0, touchStartY = 0;
    let touchMoveX = 0, touchMoveY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchActive = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchActive && e.touches.length === 1) {
        touchMoveX = (e.touches[0].clientX - touchStartX) / 40;
        touchMoveY = (e.touches[0].clientY - touchStartY) / 40;
      }
    };
    const onTouchEnd = () => {
      touchActive = false;
      touchMoveX = 0;
      touchMoveY = 0;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    // ─── Mouse look ───
    const mouseSens = 0.003;
    let camAngle = 0;
    let camPitch = 0.5;
    const CAM_DIST = 8;

    const onMouse = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        camAngle += e.movementX * mouseSens;
        camPitch = Math.max(0.1, Math.min(1.2, camPitch - e.movementY * mouseSens));
      }
    };
    canvas.addEventListener('click', () => { if (document.pointerLockElement !== canvas) canvas.requestPointerLock(); });
    document.addEventListener('mousemove', onMouse);

    // ─── Zone detection ───
    function getZoneName(px: number, pz: number): string {
      const d = [
        { name: 'The Hub', dist: Math.sqrt(px * px + (pz - 2) * (pz - 2)) },
        { name: 'Projects Valley', dist: Math.sqrt((px - 20) ** 2 + (pz + 15) ** 2) },
        { name: 'Cert Peaks', dist: Math.sqrt((px + 20) ** 2 + (pz + 15) ** 2) },
        { name: 'Community Village', dist: Math.sqrt((px - 6) ** 2 + (pz + 26) ** 2) },
      ];
      return d.reduce((a, b) => (b.dist < a.dist ? b : a)).name;
    }

    // ─── Chapter detection ───
    function getNearbyChapter(px: number, pz: number): StoryChapter | undefined {
      return CHAPTERS.find((ch) => {
        const d = Math.sqrt((px - ch.position.x) ** 2 + (pz - ch.position.z) ** 2);
        return d < 4;
      });
    }

    // ─── Nearby node ───
    function detectNearby(): AdventureNode | null {
      let best: AdventureNode | null = null;
      let bestD = 3;
      for (const n of interactables) {
        const d = Math.sqrt((vy.position.x - n.position.x) ** 2 + (vy.position.z - n.position.z) ** 2);
        if (d < bestD) { bestD = d; best = n; }
      }
      return best;
    }

    // ─── Quality update ───
    qualityUpdateRef.current = (level: number) => {
      qualityRef.current.level = level;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, level > 0 ? 1.5 : 1));
      renderer.shadowMap.enabled = level > 1;
      qualityRef.current.shadows = level > 1;
    };

    // ─── Animation ───
    let reqId: number;
    const clock = new THREE.Clock();

    function animate() {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const state = stateRef.current;

      if (state.mode === 'ADVENTURE') {
        // Movement (keyboard + touch)
        const speed = 7;
        const fwd = new THREE.Vector3(-Math.sin(camAngle), 0, -Math.cos(camAngle));
        const rgt = new THREE.Vector3(Math.cos(camAngle), 0, -Math.sin(camAngle));
        const move = new THREE.Vector3();

        if (keys['w'] || keys['arrowup'] || touchMoveY < -0.3) move.add(fwd);
        if (keys['s'] || keys['arrowdown'] || touchMoveY > 0.3) move.sub(fwd);
        if (keys['a'] || keys['arrowleft'] || touchMoveX < -0.3) move.sub(rgt);
        if (keys['d'] || keys['arrowright'] || touchMoveX > 0.3) move.add(rgt);

        if (move.length() > 0) {
          move.normalize().multiplyScalar(speed * dt);
          const nx = Math.max(-45, Math.min(45, vy.position.x + move.x));
          const nz = Math.max(-45, Math.min(45, vy.position.z + move.z));
          const gh = islandH(nx, nz);
          if (gh > 0.3) {
            vy.position.x = nx;
            vy.position.z = nz;
            vy.position.y = gh;
          }
          const ma = Math.atan2(move.x, move.z);
          vy.rotation.y += (ma - vy.rotation.y) * 0.15;
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

        // Nearby detection
        nearbyNodeRef.current = detectNearby();
        zoneRef.current = getZoneName(vy.position.x, vy.position.z);
        playerPosRef.current = { x: vy.position.x, z: vy.position.z };

        // Chapter
        const ch = getNearbyChapter(vy.position.x, vy.position.z);
        activeChapterRef.current = ch?.id ?? null;

        // Interact (E or tap on node)
        const nearby = nearbyNodeRef.current;
        if ((keys['e'] || (touchActive && nearby)) && nearby && !state.activeNode) {
          onInteract(nearby.id);
          keys['e'] = false;
      }
    } else {
      // Overview camera
      const t = Date.now() * 0.0003;
      camera.position.lerp(new THREE.Vector3(Math.sin(t) * 40, 30, Math.cos(t) * 40), 0.03);
      camera.lookAt(0, 0, 0);
    }

    // Animate crystals + sparkles
    interactables.forEach((n, i) => {
      n.group.position.y = n.position.y + Math.sin(Date.now() * 0.003 + i) * 0.25;
      n.group.children[1].rotation.y += 0.02;
    });

    const sp = sparkPts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < sparkleCount; i++) {
      sp[i * 3 + 1] = sparkleBase[i] + Math.sin(Date.now() * 0.002 + i) * 2;
    }
    sparkPts.geometry.attributes.position.needsUpdate = true;

    water.position.y = -0.3 + Math.sin(Date.now() * 0.001) * 0.08;
    renderer.render(scene, camera);
  }

  animate();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(reqId);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('mousemove', onMouse);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    renderer.dispose();
    scene.clear();
    qualityUpdateRef.current = null;
  };
}, [stateRef, onInteract]);

return {
  canvasRef,
  get nearbyNode() { return nearbyNodeRef.current; },
  get playerPosition() { return { x: playerPosRef.current.x, z: playerPosRef.current.z, islands: zoneRef.current }; },
  get qualityLevel() { return qualityRef.current.level; },
  get activeChapter() { return activeChapterRef.current; },
  setQualityLevel,
};
}
