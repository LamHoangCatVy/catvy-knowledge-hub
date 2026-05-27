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
      <div style={{
        position: 'fixed', top: 'var(--ifm-navbar-height, 60px)', left: 0, right: 0, bottom: 0,
        zIndex: 100, background: '#030305', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#e0e0e0', fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div className="mb-4 w-16 h-16 border-2 border-[#bc13fe]/20 border-t-[#00f3ff] rounded-full animate-spin" />
        <div className="text-xs text-gray-500 tracking-widest uppercase">Fetching Core Modules...</div>
      </div>
    );
  }

  return <Component />;
}

export default function Home(): React.ReactNode {
  return <PortfolioEntry />;
}
