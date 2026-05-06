declare namespace THREE {
  class Scene {
    fog: FogExp2 | null;
    background: Color | null;
    add(...objects: Object3D[]): this;
    clear(): void;
  }

  class FogExp2 {
    constructor(color: number, density: number);
  }

  class PerspectiveCamera {
    position: Vector3;
    aspect: number;
    constructor(fov: number, aspect: number, near: number, far: number);
    updateProjectionMatrix(): void;
    lookAt(x: number | Vector3, y?: number, z?: number): void;
  }

  class WebGLRenderer {
    domElement: HTMLCanvasElement;
    shadowMap: { enabled: boolean; type: number };
    sortObjects: boolean;
    constructor(params: { canvas: HTMLCanvasElement; antialias?: boolean; alpha?: boolean; powerPreference?: string });
    setSize(width: number, height: number): void;
    setPixelRatio(ratio: number): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
    toneMapping: number;
    toneMappingExposure: number;
  }

  const ACESFilmicToneMapping: number;
  const AdditiveBlending: number;
  const PCFSoftShadowMap: number;

  class Light extends Object3D { }

  class AmbientLight extends Light {
    constructor(color: number, intensity?: number);
  }

  class PointLight extends Light {
    constructor(color: number, intensity?: number, distance?: number);
  }

  class DirectionalLight extends Light {
    castShadow: boolean;
    shadow: { mapSize: { set(w: number, h: number): void }; camera: { near: number; far: number; left: number; right: number; top: number; bottom: number } };
    constructor(color: number, intensity?: number);
  }

  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    clone(): Vector3;
    add(v: Vector3): Vector3;
    sub(v: Vector3): Vector3;
    multiplyScalar(s: number): Vector3;
    normalize(): Vector3;
    lerp(v: Vector3, t: number): Vector3;
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): Vector3;
    subVectors(a: Vector3, b: Vector3): Vector3;
    setScalar(s: number): this;
    setFromVector3(v: Vector3): this;
    setFromSpherical(s: Spherical): this;
    makeSafe(): this;
    length(): number;
  }

  class Color {
    r: number;
    g: number;
    b: number;
    constructor(color: string | number);
    clone(): Color;
    lerp(color: Color, t: number): Color;
  }

  class BufferGeometry {
    setAttribute(name: string, attribute: BufferAttribute): this;
    setFromPoints(points: Vector3[]): this;
    attributes: { position: BufferAttribute };
    dispose(): void;
    computeVertexNormals(): void;
    rotateX(angle: number): this;
  }

  class BufferAttribute {
    array: Float32Array;
    needsUpdate: boolean;
    constructor(array: Float32Array, itemSize: number);
  }

  class Object3D {
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
    parent: Object3D | null;
    children: Object3D[];
    name: string;
    userData: Record<string, any>;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
    getWorldPosition(target: Vector3): Vector3;
    worldToLocal(v: Vector3): Vector3;
  }

  class Euler {
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
  }

  class Object3D {
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
    quaternion: Quaternion;
    parent: Object3D | null;
    children: Object3D[];
    name: string;
    userData: Record<string, any>;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
    getWorldPosition(target: Vector3): Vector3;
    worldToLocal(v: Vector3): Vector3;
  }

  class Group extends Object3D { }

  class Mesh extends Object3D {
    geometry: BufferGeometry;
    material: Material;
    userData: Record<string, any>;
    castShadow: boolean;
    receiveShadow: boolean;
    renderOrder: number;
    constructor(geometry: BufferGeometry, material: Material);
  }

  class Points extends Object3D {
    geometry: BufferGeometry;
    material: Material;
    constructor(geometry: BufferGeometry, material: Material);
  }

  class Line extends Object3D {
    geometry: BufferGeometry;
    material: Material;
    constructor(geometry: BufferGeometry, material: Material);
  }

  class Material {
    dispose(): void;
  }

  class PointsMaterial extends Material {
    constructor(params?: Record<string, any>);
  }
  class MeshToonMaterial extends Material {
    constructor(params?: Record<string, any>);
  }
  class MeshPhongMaterial extends Material {
    constructor(params?: Record<string, any>);
  }
  class MeshStandardMaterial extends Material {
    constructor(params?: Record<string, any>);
  }
  class MeshBasicMaterial extends Material {
    constructor(params?: Record<string, any>);
    opacity: number;
  }
  class LineBasicMaterial extends Material {
    constructor(params?: Record<string, any>);
  }

  class SphereGeometry extends BufferGeometry {
    constructor(radius: number, widthSegments?: number, heightSegments?: number, phiStart?: number, phiLength?: number, thetaStart?: number, thetaLength?: number);
  }
  class BoxGeometry extends BufferGeometry {
    constructor(width: number, height: number, depth: number);
  }
  class PlaneGeometry extends BufferGeometry {
    constructor(width: number, height: number, widthSegments?: number, heightSegments?: number);
  }
  class CylinderGeometry extends BufferGeometry {
    constructor(radiusTop?: number, radiusBottom?: number, height?: number, radialSegments?: number);
  }
  class ConeGeometry extends BufferGeometry {
    constructor(radius?: number, height?: number, radialSegments?: number);
  }
  class TorusGeometry extends BufferGeometry {
    constructor(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number);
  }
  class OctahedronGeometry extends BufferGeometry {
    constructor(radius: number, detail?: number);
  }
  class IcosahedronGeometry extends BufferGeometry {
    constructor(radius: number, detail?: number);
  }

  class Raycaster {
    setFromCamera(mouse: Vector2, camera: PerspectiveCamera): void;
    intersectObjects(objects: Object3D[]): Intersection[];
  }

  class Spherical {
    radius: number;
    phi: number;
    theta: number;
    constructor(radius?: number, phi?: number, theta?: number);
    setFromVector3(v: Vector3): this;
    setFromSpherical(s: Spherical): this;
    makeSafe(): this;
  }

  interface Intersection {
    object: Mesh;
  }

  class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
  }

  class OrbitControls {
    enableDamping: boolean;
    dampingFactor: number;
    maxDistance: number;
    minDistance: number;
    enablePan: boolean;
    enabled: boolean;
    target: Vector3;
    autoRotate: boolean;
    autoRotateSpeed: number;
    constructor(camera: PerspectiveCamera, domElement: HTMLElement);
    update(): void;
  }

  class Clock {
    constructor(autoStart?: boolean);
    getDelta(): number;
  }

  class Quaternion {
    setFromEuler(e: Euler): this;
    slerp(q: Quaternion, t: number): Quaternion;
  }

  class EffectComposer {
    constructor(renderer: WebGLRenderer);
    addPass(pass: any): void;
    render(): void;
    setSize(width: number, height: number): void;
    setPixelRatio(ratio: number): void;
    reset(): void;
    dispose?: () => void;
  }

  class RenderPass {
    constructor(scene: Scene, camera: PerspectiveCamera);
  }

  class UnrealBloomPass {
    resolution: Vector2;
    strength: number;
    radius: number;
    threshold: number;
    constructor(resolution: Vector2, strength: number, radius: number, threshold: number);
  }
}

declare namespace gsap {
  function to(target: any, vars: Record<string, any>): any;
}

interface Window {
  THREE: typeof THREE;
  gsap: typeof gsap;
  Chart: {
    new (ctx: HTMLCanvasElement, config: Record<string, any>): { destroy(): void };
    getChart(id: string): { destroy(): void } | undefined;
  };
}
