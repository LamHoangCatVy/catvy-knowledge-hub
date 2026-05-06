import { useEffect, useRef, useState } from 'react';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

interface Blog3DSceneProps {
  type: 'particles' | 'network' | 'orbit';
  color?: string;
  density?: number;
  scrollProgress?: number;
  height?: string;
}

export default function Blog3DScene({
  type = 'particles',
  color = '#00f3ff',
  density = 1,
  scrollProgress = 0,
  height = '50vh',
}: Blog3DSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const [threeReady, setThreeReady] = useState(false);

  // Load Three.js if not available
  useEffect(() => {
    if (window.THREE) { setThreeReady(true); return; }
    if (window.matchMedia('(pointer: coarse)').matches) return;
    let cancelled = false;
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js').then(() => {
      if (!cancelled) setThreeReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !window.THREE || !threeReady) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const objects: any[] = [];
    const particles: any[] = [];

    if (type === 'particles') {
      const count = Math.floor(200 * density);
      const positions = new Float32Array(count * 3);
      const particleColors = new Float32Array(count * 3);
      const hex = parseInt(color.replace('#', '0x'));

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        const brightness = 0.3 + Math.random() * 0.7;
        particleColors[i * 3] = ((hex >> 16) & 0xff) / 255 * brightness;
        particleColors[i * 3 + 1] = ((hex >> 8) & 0xff) / 255 * brightness;
        particleColors[i * 3 + 2] = (hex & 0xff) / 255 * brightness;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.8,
      });
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);
      particles.push(pts);
    } else if (type === 'network') {
      const nodeCount = Math.floor(12 * density);
      const nodeGeos: any[] = [];
      const hex = parseInt(color.replace('#', '0x'));

      for (let i = 0; i < nodeCount; i++) {
        const geo = new THREE.SphereGeometry(0.25 + Math.random() * 0.3, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8
        );
        scene.add(mesh);
        objects.push(mesh);
        nodeGeos.push(mesh);
      }

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (Math.random() < 0.25) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              nodeGeos[i].position,
              nodeGeos[j].position,
            ]);
            const lineMat = new THREE.LineBasicMaterial({
              color: hex,
              transparent: true,
              opacity: 0.15,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
            objects.push(line);
          }
        }
      }
    } else if (type === 'orbit') {
      const ringCount = Math.floor(3 * density);
      const hex = parseInt(color.replace('#', '0x'));

      for (let r = 0; r < ringCount; r++) {
        const radius = 4 + r * 3;
        const ringGeo = new THREE.TorusGeometry(radius, 0.04, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.3 - r * 0.08 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2 + r * 0.3;
        ring.rotation.y = r * 0.5;
        scene.add(ring);
        objects.push(ring);

        const coreGeo = new THREE.SphereGeometry(0.6, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        for (let i = 0; i < 3; i++) {
          const core = new THREE.Mesh(coreGeo, coreMat);
          core.position.set(
            Math.cos(i * (Math.PI * 2) / 3) * radius,
            0,
            Math.sin(i * (Math.PI * 2) / 3) * radius
          );
          ring.add(core);
        }
      }
    }

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      const sp = scrollProgress * 0.5;

      particles.forEach((p) => {
        p.rotation.y += 0.002 + sp * 0.003;
        p.rotation.x = sp * 0.3;
      });

      objects.forEach((obj) => {
        if (obj.isLine) return;
        obj.rotation.y += 0.003 + sp * 0.002;
        obj.position.y += Math.sin(Date.now() * 0.001 + obj.position.x) * 0.005;
      });

      camera.position.z = 30 - sp * 10;
      camera.position.y = sp * 3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = { scene, camera, renderer, objects, animate };

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.clear();
    };
  }, [type, color, density, threeReady]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.scene.rotation.y = scrollProgress * 0.3;
    }
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className="blog-3d-scene"
      style={{ height }}
    >
      <canvas ref={canvasRef} className="blog-3d-canvas" />
      <div className="blog-3d-gradient" style={{ background: `radial-gradient(ellipse at center, ${color}15 0%, transparent 70%)` }} />
    </div>
  );
}
