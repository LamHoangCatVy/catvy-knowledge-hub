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
      <div className="fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center text-[#e0e0e0] font-mono">
        <div className="w-16 h-16 border-2 border-[#bc13fe]/20 border-t-[#00f3ff] rounded-full animate-spin mb-4" />
        <div className="text-xs text-gray-500 tracking-widest uppercase">Loading Portfolio...</div>
      </div>
    );
  }

  return <MainApp />;
}
