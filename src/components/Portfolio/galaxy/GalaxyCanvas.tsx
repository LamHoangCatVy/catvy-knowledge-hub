import { type RefObject } from 'react';

interface GalaxyCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  visible?: boolean;
}

export default function GalaxyCanvas({ canvasRef, visible = true }: GalaxyCanvasProps) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-0">
      <canvas
        ref={canvasRef}
        id="webgl"
        className="w-full h-full touch-none outline-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
