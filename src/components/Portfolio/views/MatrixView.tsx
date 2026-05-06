import type { NodeData } from '../data/constants';
import { NODE_COLORS } from '../data/constants';
import { Accordion } from '../ui';

interface MatrixViewProps {
  visible: boolean;
  activeNode: string | null;
  activeNodeData: NodeData | null;
  onCloseNode: () => void;
  onSelectNode: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
  discoveredCount?: number;
  totalNodes?: number;
  toastMessage?: string | null;
  audioMuted?: boolean;
  onToggleAudio?: () => void;
  audioAvailable?: boolean;
  showShortcuts?: boolean;
  onToggleShortcuts?: () => void;
}

export default function MatrixView({
  visible,
  activeNode,
  activeNodeData,
  onCloseNode,
  onSelectNode,
  onPrev,
  onNext,
  discoveredCount = 0,
  totalNodes = 0,
  toastMessage = null,
  audioMuted = true,
  onToggleAudio,
  audioAvailable = true,
  showShortcuts = false,
  onToggleShortcuts,
}: MatrixViewProps) {
  return (
    <div
      className={`fixed inset-0 z-30 pointer-events-none transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Hover label */}
      <div
        className={`absolute bottom-8 left-8 font-mono text-[14px] text-white/80 uppercase tracking-widest z-[260] transition-opacity duration-300 ${
          !activeNode ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span id="hovered-node-name" className="font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      </div>

      {/* Mobile instruction */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/80 uppercase tracking-widest md:hidden bg-black/50 px-4 py-2 rounded-full border border-white/10 text-center w-[80%] max-w-[300px] pointer-events-auto transition-opacity duration-500 ${
          activeNode ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <i className="fas fa-hand-pointer mr-2" /> DRAG TO ROTATE / TAP TO OPEN
      </div>

      {/* Audio toggle button (Item 22) */}
      {onToggleAudio && (
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 md:bottom-8 md:left-8 md:translate-x-0 pointer-events-auto z-[260] transition-all duration-500 ${
            activeNode ? 'opacity-0' : 'opacity-100'
          } ${!activeNode && showShortcuts ? 'md:left-64' : ''}`}
        >
          <button
            onClick={onToggleAudio}
            className="w-10 h-10 rounded-full bg-[#0a0c12]/80 border border-white/10 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title={audioMuted ? 'Unmute ambient audio' : 'Mute ambient audio'}
          >
            <i className={`fas ${audioMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-sm`} />
          </button>
        </div>
      )}

      {/* Nav dock */}
      <div
        className={`absolute bottom-[100px] md:bottom-8 right-8 flex gap-4 bg-[#0a0c12]/80 p-3 rounded-full border border-white/10 backdrop-blur-md pointer-events-auto transition-all duration-500 z-[260] ${
          activeNode ? 'translate-y-32 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
      >
        <button
          onClick={() => onSelectNode('core_projects')}
          className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-[#00ff88] hover:bg-white/10 transition-all"
          title="Projects"
        >
          <i className="fas fa-microchip text-xl" />
        </button>
        <button
          onClick={() => onSelectNode('core_certs')}
          className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-[#ffaa00] hover:bg-white/10 transition-all"
          title="Certs"
        >
          <i className="fas fa-award text-xl" />
        </button>
        <button
          onClick={() => onSelectNode('core_comm')}
          className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-[#ff0055] hover:bg-white/10 transition-all"
          title="Community"
        >
          <i className="fas fa-users text-xl" />
        </button>
      </div>

      {/* Keyboard shortcuts overlay (Item 21) */}
      {showShortcuts && !activeNode && (
        <div className="absolute bottom-20 left-4 md:bottom-24 md:left-8 z-[300] pointer-events-auto bg-[#0a0c12]/95 border border-white/10 rounded-xl p-4 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <span className="text-white/80 font-mono text-[10px] font-bold uppercase tracking-widest">Keyboard Shortcuts</span>
            <button
              onClick={onToggleShortcuts}
              className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-times text-[10px]" />
            </button>
          </div>
          <div className="space-y-1.5 text-[10px] font-mono">
            <div className="flex items-center gap-3">
              <span className="text-white/50 w-16">←↑↓→</span>
              <span className="text-gray-400">Rotate camera</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 w-16">Tab</span>
              <span className="text-gray-400">Cycle nodes</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 w-16">Enter</span>
              <span className="text-gray-400">Open node</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 w-16">Escape</span>
              <span className="text-gray-400">Close / deselect</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 w-16">Space</span>
              <span className="text-gray-400">Toggle auto-rotate</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 w-16">?</span>
              <span className="text-gray-400">Toggle this panel</span>
            </div>
          </div>
        </div>
      )}

      {/* Constellation discovery toast (Item 20) */}
      {toastMessage && !activeNode && (
        <div className="absolute bottom-4 right-4 z-[300] pointer-events-none">
          <div className="bg-[#0a0c12]/95 border border-[#00f3ff]/30 rounded-lg px-4 py-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.15)] animate-fade-in">
            <p className="font-mono text-[11px] text-[#00f3ff] font-bold uppercase tracking-wider whitespace-nowrap">
              {toastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Centered Modal */}
      {activeNode && activeNodeData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseNode} />

          <div className="relative w-full max-w-[800px] max-h-[85dvh] max-h-[85vh] bg-[#0a0c12]/95 border border-white/10 rounded-2xl p-8 md:p-10 overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in z-10 flex flex-col">
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
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2"
                style={{ color: activeNodeData.color }}
              >
                {activeNodeData.title}
              </h2>
              <p className="font-mono text-[11px] text-gray-400 uppercase tracking-widest">
                {activeNodeData.subtitle}
              </p>

              {activeNodeData.type === 'sub' && (
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={onPrev}
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded font-mono text-[10px] font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-chevron-left" /> PREV
                  </button>
                  <button
                    onClick={onNext}
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded font-mono text-[10px] font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    NEXT <i className="fas fa-chevron-right" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1">
              {activeNodeData.type === 'core' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {activeNodeData.list.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectNode(item.id)}
                      className="p-5 bg-white/5 border border-white/10 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/30"
                      style={{ borderLeftWidth: '4px', borderLeftColor: activeNodeData.color }}
                    >
                      <h4 className="text-white font-bold text-sm mb-2">{item.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{item.subtitle}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
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

                  <div className="flex flex-wrap gap-2 mt-8">
                    {activeNodeData.tags?.map((t: string) => (
                      <span
                        key={t}
                        className="inline-flex items-center text-[10px] font-mono px-3 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10 uppercase"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
