import { useState, useEffect } from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import '../css/custom.css';

function PortfolioEntry() {
  const isBrowser = useIsBrowser();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (isBrowser) {
      import('@site/src/components/Portfolio/AppWrapper').then((mod) => {
        setComponent(() => mod.default);
      });
    }
  }, [isBrowser]);

  if (!Component) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center text-[#e0e0e0] font-mono">
        <div className="w-16 h-16 border-2 border-[#bc13fe]/20 border-t-[#00f3ff] rounded-full animate-spin mb-4" />
        <div className="text-xs text-gray-500 tracking-widest uppercase">Fetching Core Modules...</div>
      </div>
    );
  }

  return <Component />;
}

export default function Home(): React.ReactNode {
  return <PortfolioEntry />;
}
