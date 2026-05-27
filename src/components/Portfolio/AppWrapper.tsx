import { useState, useEffect } from 'react';

export default function AppWrapper() {
  const [MainApp, setMainApp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const mod = await import('./PortfolioApp');
        setMainApp(() => mod.default);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      }
    };
    init();
  }, []);

  if (!MainApp) {
    return (
      <div style={{
        position: 'fixed', top: 'var(--ifm-navbar-height, 60px)', left: 0, right: 0, bottom: 0,
        zIndex: 100, background: '#030305', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#e0e0e0', fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div className="mb-4 w-16 h-16 border-2 border-[#bc13fe]/20 border-t-[#00f3ff] rounded-full animate-spin" />
        <div className="text-xs text-gray-500 tracking-widest uppercase">Loading Portfolio...</div>
      </div>
    );
  }

  return <MainApp />;
}
