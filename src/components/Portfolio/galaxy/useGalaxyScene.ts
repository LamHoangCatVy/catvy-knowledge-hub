import { useRef, useEffect, type RefObject } from 'react';
import { NODE_COLORS } from '../data/constants';
import { PROJECTS_DATA } from '../data/projects';
import { CERTS_DATA } from '../data/certifications';
import { COMMUNITY_DATA } from '../data/community';
import { getNodeData } from '../data/helpers';

interface GalaxyState {
  mode: string;
  activeNode: string | null;
  discoveredNodeIds: string[];
}

interface GalaxySceneReturn {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  setHover: () => void;
  clearHover: () => void;
}

export function useGalaxyScene(stateRef: RefObject<GalaxyState>): GalaxySceneReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const composerRef = useRef<THREE.EffectComposer | null>(null);
  const nodesRef = useRef<{
    proj: Array<{ id: string; group: THREE.Group; shell: THREE.Mesh; core: THREE.Mesh }>;
    cert: Array<{ id: string; group: THREE.Group; shell: THREE.Mesh; core: THREE.Mesh }>;
    comm: Array<{ id: string; group: THREE.Group; shell: THREE.Mesh; core: THREE.Mesh }>;
    cores: Record<string, { id: string; group: THREE.Group; shell: THREE.Mesh; core: THREE.Mesh }>;
  }>({ proj: [], cert: [], comm: [], cores: {} });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.THREE) return;

    const THREE = window.THREE;
    const gsap = window.gsap;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x030305, 0.015);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 25);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const composer = window.THREE.EffectComposer
      ? new THREE.EffectComposer(renderer)
      : null;
    let useComposer = false;
    composerRef.current = composer;

    if (composer && window.THREE.RenderPass && window.THREE.UnrealBloomPass) {
      const renderPass = new THREE.RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,
        0.4,
        0.6
      );
      composer.addPass(bloomPass);
      useComposer = true;
    }

    const OrbitControls = window.THREE.OrbitControls;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 150;
    controls.minDistance = 5;
    controls.enablePan = false;
    controls.enabled = false;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.3;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0x221144, 2.0));
    const coreLight = new THREE.PointLight(0xffccaa, 5, 200);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // ----- Item 19: Starfield -----
    const starCount = 700;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starBaseX = new Float32Array(starCount);
    const starBaseY = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 200;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      starPositions[i * 3 + 2] = -50 - Math.random() * 50;

      starBaseX[i] = starPositions[i * 3];
      starBaseY[i] = starPositions[i * 3 + 1];

      const brightness = 0.4 + Math.random() * 0.6;
      starColors[i * 3] = brightness;
      starColors[i * 3 + 1] = brightness;
      starColors[i * 3 + 2] = brightness;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.7,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // ----- Galaxy particles -----
    const particleCount = 12000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorInside = new THREE.Color('#ffaa00');
    const colorOutside = new THREE.Color('#bc13fe');

    const arms = 4;
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 150;
      const spinAngle = radius * 0.04;
      const branchAngle = ((i % arms) / arms) * Math.PI * 2;

      const spread = Math.pow(Math.random(), 2) * 20;
      const randomX = (Math.random() - 0.5) * spread;
      const randomY = (Math.random() - 0.5) * (spread * 0.4);
      const randomZ = (Math.random() - 0.5) * spread;

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i * 3 + 1] = randomY - 5;
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = colorInside.clone().lerp(colorOutside, radius / 150);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    const galGeo = new THREE.BufferGeometry();
    galGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const galMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.8,
    });
    const galaxy = new THREE.Points(galGeo, galMat);
    galaxy.rotation.x = Math.PI * 0.1;
    galaxy.rotation.z = Math.PI * 0.05;
    scene.add(galaxy);

    const interactables: THREE.Mesh[] = [];
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);
    const dynamicLines: Array<{ line: THREE.Line; objA: THREE.Group; objB: THREE.Group }> = [];

    // Node creation helper
    const createNode = (id: string, x: number, y: number, z: number, col: string, size: number, isCube = false) => {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      const cNum = parseInt(col.replace('#', '0x'));

      let coreGeo: THREE.BufferGeometry;
      if (isCube) coreGeo = new THREE.BoxGeometry(size * 0.6, size * 0.6, size * 0.6);
      else coreGeo = new THREE.OctahedronGeometry(size * 0.5, 0);

      const coreMat = new THREE.MeshPhongMaterial({
        color: cNum,
        emissive: cNum,
        emissiveIntensity: 0.8,
        flatShading: true,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);

      const shellGeo = new THREE.IcosahedronGeometry(size, 1);
      const shellMat = new THREE.MeshStandardMaterial({
        color: cNum,
        emissive: cNum,
        emissiveIntensity: 0.5,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      });
      const shell = new THREE.Mesh(shellGeo, shellMat);

      const hitbox = new THREE.Mesh(
        new THREE.SphereGeometry(size * 3),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitbox.userData = { id, col, title: getNodeData(id)?.title || id };

      grp.add(core, shell, hitbox);
      nodeGroup.add(grp);
      interactables.push(hitbox);
      return { id, group: grp, shell, core };
    };

    // Create core nodes
    const projCore = createNode('core_projects', 0, 0, 0, NODE_COLORS.projects, 2.5, false);
    const certsCore = createNode('core_certs', -25, 5, -15, NODE_COLORS.certs, 2.0, false);
    const commCore = createNode('core_comm', 25, -5, -15, NODE_COLORS.community, 2.0, false);

    nodesRef.current.cores = { proj: projCore, cert: certsCore, comm: commCore };

    // Sub nodes
    const projNodes: typeof nodesRef.current.proj = [];
    const certNodes: typeof nodesRef.current.cert = [];
    const commNodes: typeof nodesRef.current.comm = [];

    PROJECTS_DATA.forEach((p) => projNodes.push(createNode(p.id, 0, 0, 0, NODE_COLORS.projects, 0.6, true)));
    CERTS_DATA.forEach((c) => certNodes.push(createNode(c.id, 0, 0, 0, NODE_COLORS.certs, 0.6, false)));
    COMMUNITY_DATA.forEach((c) => commNodes.push(createNode(c.id, 0, 0, 0, NODE_COLORS.community, 0.6, false)));

    nodesRef.current.proj = projNodes;
    nodesRef.current.cert = certNodes;
    nodesRef.current.comm = commNodes;

    // Dynamic lines
    const createDynamicLine = (objA: THREE.Group, objB: THREE.Group, col: string) => {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        new THREE.LineBasicMaterial({
          color: parseInt(col.replace('#', '0x')),
          transparent: true,
          opacity: 0.15,
        })
      );
      nodeGroup.add(line);
      dynamicLines.push({ line, objA, objB });
    };

    // Only core-to-sub-nodes lines (no cross-core connections)
    projNodes.forEach((n) => createDynamicLine(projCore.group, n.group, NODE_COLORS.projects));
    certNodes.forEach((n) => createDynamicLine(certsCore.group, n.group, NODE_COLORS.certs));
    commNodes.forEach((n) => createDynamicLine(commCore.group, n.group, NODE_COLORS.community));

    // ----- Item 17: Particle trail system behind sub-nodes -----
    const trailSize = 25;
    const allSubNodes = [...projNodes, ...certNodes, ...commNodes];
    const trailSystems: Array<{
      points: THREE.Points;
      node: { group: THREE.Group };
      color: THREE.Color;
      buffer: Float32Array;
      positions: Float32Array;
    }> = [];

    allSubNodes.forEach((nodeData) => {
      const { id } = nodeData;
      let col = '#ffffff';
      if (id.startsWith('proj')) col = NODE_COLORS.projects;
      else if (id.startsWith('cert')) col = NODE_COLORS.certs;
      else if (id.startsWith('comm')) col = NODE_COLORS.community;

      const trailColor = new THREE.Color(col);
      const buf = new Float32Array(trailSize * 3);
      const trailPositions = new Float32Array(trailSize * 3);

      const wp = new THREE.Vector3();
      nodeData.group.getWorldPosition(wp);
      for (let i = 0; i < trailSize; i++) {
        trailPositions[i * 3] = wp.x;
        trailPositions[i * 3 + 1] = wp.y;
        trailPositions[i * 3 + 2] = wp.z;
      }

      const trailColors = new Float32Array(trailSize * 3);
      for (let i = 0; i < trailSize; i++) {
        const t = i / (trailSize - 1);
        const alpha = 1 - t;
        trailColors[i * 3] = trailColor.r * alpha;
        trailColors[i * 3 + 1] = trailColor.g * alpha;
        trailColors[i * 3 + 2] = trailColor.b * alpha;
      }

      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
      const trailMat = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.5,
      });
      const trailPoints = new THREE.Points(trailGeo, trailMat);
      nodeGroup.add(trailPoints);

      trailSystems.push({
        points: trailPoints,
        node: nodeData,
        color: trailColor,
        buffer: buf,
        positions: trailPositions,
      });
    });

    // ----- Item 18: Energy pulses along connection lines -----
    const pulseMeshes: Array<{
      mesh: THREE.Mesh;
      line: THREE.Line;
      objA: THREE.Group;
      objB: THREE.Group;
      startTime: number;
      duration: number;
      color: number;
    }> = [];

    let lastPulseTime = performance.now();
    const getPulseInterval = () => 3000 + Math.random() * 2000;

    const createPulse = () => {
      if (dynamicLines.length === 0) return;
      const dlIndex = Math.floor(Math.random() * dynamicLines.length);
      const { objA, objB } = dynamicLines[dlIndex];

      const pulseGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const targetCol = dlIndex < 2 ? NODE_COLORS.core : NODE_COLORS.projects;
      const pulseMat = new THREE.MeshBasicMaterial({
        color: parseInt(targetCol.replace('#', '0x')),
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      nodeGroup.add(pulseMesh);

      pulseMeshes.push({
        mesh: pulseMesh,
        line: dynamicLines[dlIndex].line,
        objA: dynamicLines[dlIndex].objA,
        objB: dynamicLines[dlIndex].objB,
        startTime: performance.now(),
        duration: 800,
        color: parseInt(targetCol.replace('#', '0x')),
      });
    };

    // ----- Item 20: Constellation discovery lines -----
    const constellationGroup = new THREE.Group();
    nodeGroup.add(constellationGroup);
    let prevDiscoveredIds: string[] = [];
    let constellationMaterial: THREE.LineBasicMaterial | null = null;

    const rebuildConstellation = (discoveredIds: string[]) => {
      while (constellationGroup.children.length > 0) {
        constellationGroup.remove(constellationGroup.children[0]);
      }

      if (discoveredIds.length < 2) return;

      const allNodes = [
        projCore, certsCore, commCore,
        ...projNodes, ...certNodes, ...commNodes,
      ];
      const nodeMap = new Map<string, THREE.Group>();
      allNodes.forEach((n) => nodeMap.set(n.id, n.group));

      // Group discovered nodes by category, only connect within same category
      const groups: Record<string, string[]> = { proj: [], cert: [], comm: [] };
      for (const id of discoveredIds) {
        if (id.startsWith('proj_') || id === 'core_projects') groups.proj.push(id);
        else if (id.startsWith('cert_') || id === 'core_certs') groups.cert.push(id);
        else if (id.startsWith('comm_') || id === 'core_comm') groups.comm.push(id);
      }

      for (const cat of ['proj', 'cert', 'comm'] as const) {
        const ids = groups[cat];
        if (ids.length < 2) continue;
        const catColor = cat === 'proj' ? 0x00ff88 : cat === 'cert' ? 0xffaa00 : 0xff0055;
        for (let i = 1; i < ids.length; i++) {
          const a = nodeMap.get(ids[i - 1]);
          const b = nodeMap.get(ids[i]);
          if (!a || !b) continue;

          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
            new THREE.LineBasicMaterial({
              color: catColor,
              transparent: true,
              opacity: 0.5,
            })
          );
          constellationGroup.add(line);
        }
      }
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObj: THREE.Mesh | null = null;
    let pointerDownPos = { x: 0, y: 0 };
    let mouseScreenX = window.innerWidth / 2;
    let mouseScreenY = window.innerHeight / 2;

    const onPointerMove = (e: PointerEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mouseScreenX = clientX;
      mouseScreenY = clientY;
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent | TouchEvent) => {
      pointerDownPos.x = e instanceof MouseEvent ? e.clientX : (e as TouchEvent).touches?.[0]?.clientX || 0;
      pointerDownPos.y = e instanceof MouseEvent ? e.clientY : (e as TouchEvent).touches?.[0]?.clientY || 0;
    };

    const onPointerUp = (e: PointerEvent | TouchEvent) => {
      const state = stateRef.current;
      if (state.mode !== 'MATRIX') return;

      const clientX = e instanceof MouseEvent ? e.clientX : (e as TouchEvent).changedTouches?.[0]?.clientX || 0;
      const clientY = e instanceof MouseEvent ? e.clientY : (e as TouchEvent).changedTouches?.[0]?.clientY || 0;

      const dx = Math.abs(clientX - pointerDownPos.x);
      const dy = Math.abs(clientY - pointerDownPos.y);
      if (dx > 5 || dy > 5) return;

      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(interactables);
      if (intersects.length > 0) {
        const nodeId = intersects[0].object.userData.id;
        if (window._setActiveNode) window._setActiveNode(nodeId);
      } else {
        if (state.activeNode && window._setActiveNode) window._setActiveNode(null);
      }
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('pointermove', onPointerMove);
    canvasEl.addEventListener('pointerdown', onPointerDown);
    canvasEl.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (composer) composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let reqId: number;
    let layoutTime = 0;

    const tick = () => {
      const state = stateRef.current;
      const t = performance.now() * 0.001;

      if (!state.activeNode) layoutTime += 0.0005;

      if (state.mode !== 'MATRIX') {
        controls.enabled = false;
        camera.position.x += (Math.sin(t * 0.2) * 2 - camera.position.x) * 0.05;
        camera.position.y += (5 - camera.position.y) * 0.05;
        camera.position.z += (25 - camera.position.z) * 0.05;
        camera.lookAt(0, 0, 0);
      } else {
        controls.enabled = !state.activeNode;
        if (controls.enabled) controls.update();
      }

      nodeGroup.position.y = Math.sin(layoutTime) * 1.5;
      galaxy.rotation.y = layoutTime * 0.05;

      [projCore, certsCore, commCore].forEach((core) => {
        core.shell.rotation.y = layoutTime * 2.5;
        core.shell.rotation.x = layoutTime * 1;
        core.core.rotation.y = -layoutTime * 2.5;
      });

      projCore.group.position.x = Math.sin(layoutTime * 0.5) * 8;
      projCore.group.position.z = Math.cos(layoutTime * 0.5) * 8;

      certsCore.group.position.x = Math.sin(layoutTime * 0.8 + Math.PI / 2) * 18;
      certsCore.group.position.z = Math.cos(layoutTime * 0.8 + Math.PI / 2) * 18;

      commCore.group.position.x = Math.sin(layoutTime * 0.6 + Math.PI) * 25;
      commCore.group.position.z = Math.cos(layoutTime * 0.6 + Math.PI) * 25;

      const updateOrbits = (
        nodesList: Array<{ group: THREE.Group; shell: THREE.Mesh; core: THREE.Mesh }>,
        centerNode: { group: THREE.Group },
        baseRadius: number,
        speedMult: number
      ) => {
        nodesList.forEach((sub, idx) => {
          sub.shell.rotation.y = layoutTime * 5;
          sub.core.rotation.x = -layoutTime * 5;

          const ringLevel = idx % 3;
          const r = baseRadius + ringLevel * 3.5;
          const a = (idx / nodesList.length) * Math.PI * 2 + layoutTime * (speedMult / (ringLevel + 1));

          sub.group.position.x = centerNode.group.position.x + Math.cos(a) * r;
          sub.group.position.z = centerNode.group.position.z + Math.sin(a) * r;

          const inclination = idx % 2 === 0 ? 1 : -1;
          sub.group.position.y = centerNode.group.position.y + Math.sin(a * 2) * 2 * inclination;
        });
      };

      updateOrbits(projNodes, projCore, 9, 4);
      updateOrbits(certNodes, certsCore, 7, -5);
      updateOrbits(commNodes, commCore, 6, 6);

      // ----- Update dynamic lines -----
      dynamicLines.forEach((dl) => {
        const pos = dl.line.geometry.attributes.position.array as Float32Array;
        const wpA = new THREE.Vector3();
        dl.objA.getWorldPosition(wpA);
        const wpB = new THREE.Vector3();
        dl.objB.getWorldPosition(wpB);
        nodeGroup.worldToLocal(wpA);
        nodeGroup.worldToLocal(wpB);
        pos[0] = wpA.x;
        pos[1] = wpA.y;
        pos[2] = wpA.z;
        pos[3] = wpB.x;
        pos[4] = wpB.y;
        pos[5] = wpB.z;
        dl.line.geometry.attributes.position.needsUpdate = true;
      });

      // ----- Starfield parallax (Item 19) -----
      const starParallaxFactor = 0.02;
      const starOffsetX = ((mouseScreenX / window.innerWidth) - 0.5) * starParallaxFactor * 100;
      const starOffsetY = ((mouseScreenY / window.innerHeight) - 0.5) * starParallaxFactor * 60;
      const starPos = starfield.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = starBaseX[i] - starOffsetX * (0.5 + (Math.abs(starBaseX[i]) / 100));
        starPos[i * 3 + 1] = starBaseY[i] - starOffsetY * (0.5 + (Math.abs(starBaseY[i]) / 60));
      }
      starfield.geometry.attributes.position.needsUpdate = true;

      // ----- Update particle trails (Item 17) -----
      trailSystems.forEach((trail) => {
        const wp = new THREE.Vector3();
        trail.node.group.getWorldPosition(wp);
        nodeGroup.worldToLocal(wp);

        const posArr = trail.positions;

        // Shift all positions back
        for (let i = trailSize - 1; i > 0; i--) {
          posArr[i * 3] = posArr[(i - 1) * 3];
          posArr[i * 3 + 1] = posArr[(i - 1) * 3 + 1];
          posArr[i * 3 + 2] = posArr[(i - 1) * 3 + 2];
        }

        // Set head to current node position
        posArr[0] = wp.x;
        posArr[1] = wp.y;
        posArr[2] = wp.z;

        trail.points.geometry.attributes.position.needsUpdate = true;
      });

      // ----- Energy pulses (Item 18) -----
      const now = performance.now();
      if (now - lastPulseTime > getPulseInterval()) {
        lastPulseTime = now;
        if (pulseMeshes.length < 5) {
          createPulse();
        }
      }

      for (let i = pulseMeshes.length - 1; i >= 0; i--) {
        const pulse = pulseMeshes[i];
        const elapsed = now - pulse.startTime;
        const progress = Math.min(elapsed / pulse.duration, 1);

        if (progress >= 1) {
          nodeGroup.remove(pulse.mesh);
          pulse.mesh.geometry.dispose();
          (pulse.mesh.material as THREE.Material).dispose();
          pulseMeshes.splice(i, 1);
          continue;
        }

        const posArr = pulse.line.geometry.attributes.position.array as Float32Array;
        const ax = posArr[0], ay = posArr[1], az = posArr[2];
        const bx = posArr[3], by = posArr[4], bz = posArr[5];

        pulse.mesh.position.set(
          ax + (bx - ax) * progress,
          ay + (by - ay) * progress,
          az + (bz - az) * progress
        );

        const fade = progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7;
        (pulse.mesh.material as THREE.MeshBasicMaterial).opacity = fade;
        pulse.mesh.scale.setScalar(0.5 + 0.5 * fade);
      }

      // ----- Constellation discovery lines (Item 20) -----
      const discoveredIds = stateRef.current.discoveredNodeIds || [];
      if (discoveredIds.length !== prevDiscoveredIds.length ||
        discoveredIds.some((id, i) => id !== prevDiscoveredIds[i])) {
        rebuildConstellation(discoveredIds);
        prevDiscoveredIds = [...discoveredIds];
      }

      // Update constellation line positions
      const allNodesForConst = [
        projCore, certsCore, commCore,
        ...projNodes, ...certNodes, ...commNodes,
      ];
      const nodeMapForConst = new Map<string, THREE.Group>();
      allNodesForConst.forEach((n) => nodeMapForConst.set(n.id, n.group));

      constellationGroup.children.forEach((line, idx) => {
        if (idx + 1 >= discoveredIds.length) return;
        const a = nodeMapForConst.get(discoveredIds[idx]);
        const b = nodeMapForConst.get(discoveredIds[idx + 1]);
        if (!a || !b) return;
        const wpA = new THREE.Vector3();
        a.getWorldPosition(wpA);
        const wpB = new THREE.Vector3();
        b.getWorldPosition(wpB);
        nodeGroup.worldToLocal(wpA);
        nodeGroup.worldToLocal(wpB);
        const posArr = (line as THREE.Line).geometry.attributes.position.array as Float32Array;
        posArr[0] = wpA.x; posArr[1] = wpA.y; posArr[2] = wpA.z;
        posArr[3] = wpB.x; posArr[4] = wpB.y; posArr[5] = wpB.z;
        (line as THREE.Line).geometry.attributes.position.needsUpdate = true;
      });

      // ----- Hover detection -----
      if (state.mode === 'MATRIX' && !state.activeNode) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactables);
        if (intersects.length > 0) {
          if (hoveredObj !== intersects[0].object) {
            if (hoveredObj) gsap.to(hoveredObj.parent!.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
            hoveredObj = intersects[0].object as THREE.Mesh;
            gsap.to(hoveredObj.parent!.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.3, ease: 'back.out(1.5)' });

            const labelEl = document.getElementById('hovered-node-name');
            if (labelEl && !window.matchMedia('(pointer: coarse)').matches) {
              const nodeId = hoveredObj.userData.id;
              labelEl.innerText = nodeId;
              labelEl.style.color = hoveredObj.userData.col;
            }
            document.body.style.cursor = 'pointer';
          }
        } else if (hoveredObj) {
          gsap.to(hoveredObj.parent!.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
          hoveredObj = null;
          const labelEl = document.getElementById('hovered-node-name');
          if (labelEl) labelEl.innerText = '';
          document.body.style.cursor = 'auto';
        }
      }

      if (useComposer) {
        composer!.render();
      } else {
        renderer.render(scene, camera);
      }
      reqId = requestAnimationFrame(tick);
    };

    reqId = requestAnimationFrame(tick);

    const moveCameraToNode = () => {
      if (!gsap || !cameraRef.current || !controlsRef.current) return;

      const state = stateRef.current;
      if (state.activeNode) {
        let targetGroup: THREE.Group | undefined;
        const id = state.activeNode;

        if (id === 'core_projects') targetGroup = nodesRef.current.cores.proj?.group;
        else if (id === 'core_certs') targetGroup = nodesRef.current.cores.cert?.group;
        else if (id === 'core_comm') targetGroup = nodesRef.current.cores.comm?.group;
        else if (id.startsWith('proj'))
          targetGroup = nodesRef.current.proj.find((n) => n.id === id)?.group;
        else if (id.startsWith('cert'))
          targetGroup = nodesRef.current.cert.find((n) => n.id === id)?.group;
        else if (id.startsWith('comm'))
          targetGroup = nodesRef.current.comm.find((n) => n.id === id)?.group;

        if (targetGroup) {
          const wp = new window.THREE.Vector3();
          targetGroup.getWorldPosition(wp);
          const isCore = id.startsWith('core_');
          const offset = new window.THREE.Vector3(0, isCore ? 2 : 1, isCore ? 35 : 15);
          const finalPos = wp.clone().add(offset);
          gsap.to(cameraRef.current.position, {
            x: finalPos.x,
            y: finalPos.y,
            z: finalPos.z,
            duration: 1.5,
            ease: 'power3.inOut',
          });
          gsap.to(controlsRef.current.target, {
            x: wp.x,
            y: wp.y,
            z: wp.z,
            duration: 1.5,
            ease: 'power3.inOut',
          });
        }
      } else if (state.mode === 'MATRIX') {
        gsap.to(cameraRef.current.position, {
          x: 0,
          y: 20,
          z: 60,
          duration: 1.5,
          ease: 'power3.inOut',
        });
        gsap.to(controlsRef.current.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.5,
          ease: 'power3.inOut',
        });

        document.body.style.cursor = 'auto';
        const labelEl = document.getElementById('hovered-node-name');
        if (labelEl) labelEl.innerText = '';
      }
    };

    window._triggerCameraMove = moveCameraToNode;

    // ----- Item 21: Keyboard support helpers -----
    window._getAllInteractableNodeIds = () =>
      interactables.map((m) => m.userData.id as string);

    let highlightedNodeIdx = -1;
    const allInteractableIds = interactables.map((m) => m.userData.id as string);

    window._getHighlightedNodeId = () =>
      highlightedNodeIdx >= 0 && highlightedNodeIdx < allInteractableIds.length
        ? allInteractableIds[highlightedNodeIdx]
        : null;

    window._highlightNextNode = () => {
      if (interactables.length === 0) return;

      if (hoveredObj) {
        gsap.to(hoveredObj.parent!.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
      }

      highlightedNodeIdx = (highlightedNodeIdx + 1) % interactables.length;
      hoveredObj = interactables[highlightedNodeIdx];

      gsap.to(hoveredObj.parent!.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.3, ease: 'back.out(1.5)' });

      const labelEl = document.getElementById('hovered-node-name');
      if (labelEl) {
        labelEl.innerText = hoveredObj.userData.title || hoveredObj.userData.id;
        labelEl.style.color = hoveredObj.userData.col;
      }
      document.body.style.cursor = 'pointer';

      // Also move camera to look at the highlighted node
      const wp = new THREE.Vector3();
      hoveredObj.parent!.getWorldPosition(wp);
      gsap.to(controls.target, {
        x: wp.x,
        y: wp.y,
        z: wp.z,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    window._triggerAutoRotateToggle = () => {
      controls.autoRotate = !controls.autoRotate;
      return controls.autoRotate;
    };

    window._triggerCameraRotate = (dir: string) => {
      const angle = 0.3;
      const target = controls.target;
      const offset = new THREE.Vector3().subVectors(camera.position, target);
      const SphericalCtor = (window.THREE as any).Spherical;
      if (!SphericalCtor) {
        // Fallback manual rotation
        const camX = camera.position.x;
        const camZ = camera.position.z;
        if (dir === 'left') {
          camera.position.x = camX * Math.cos(-angle) - camZ * Math.sin(-angle);
          camera.position.z = camX * Math.sin(-angle) + camZ * Math.cos(-angle);
        } else if (dir === 'right') {
          camera.position.x = camX * Math.cos(angle) - camZ * Math.sin(angle);
          camera.position.z = camX * Math.sin(angle) + camZ * Math.cos(angle);
        }
        camera.lookAt(target);
        return;
      }
      const spherical = new SphericalCtor();
      spherical.setFromVector3(offset);
      if (dir === 'left') spherical.theta -= angle;
      else if (dir === 'right') spherical.theta += angle;
      else if (dir === 'up' && spherical.phi > 0.2) spherical.phi -= angle;
      else if (dir === 'down' && spherical.phi < Math.PI / 2 - 0.1) spherical.phi += angle;
      spherical.makeSafe();
      offset.setFromSpherical(spherical);
      camera.position.copy(target).add(offset);
      camera.lookAt(target);
      controls.target.copy(target);
    };

    return () => {
      cancelAnimationFrame(reqId);
      canvasEl.removeEventListener('pointermove', onPointerMove);
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      canvasEl.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (composer) composer.reset();
      window._triggerCameraMove = null;
      window._getAllInteractableNodeIds = null;
      window._highlightNextNode = null;
      window._getHighlightedNodeId = null;
      window._triggerAutoRotateToggle = null;
      window._triggerCameraRotate = null;
    };
  }, [stateRef]);

  return {
    canvasRef,
    setHover: () => {},
    clearHover: () => {},
  };
}
