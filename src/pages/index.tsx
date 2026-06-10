import { useState, useEffect } from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Layout from '@theme/Layout';

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
        <div style={{ width: 64, height: 64, border: '2px solid rgba(188,19,254,0.2)', borderTopColor: '#00f3ff', borderRadius: '50%', marginBottom: 16, animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: 12, color: '#888', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Fetching Core Modules...</div>
      </div>
    );
  }

  return <Component />;
}

export default function Home(): React.ReactNode {
  return (
    <Layout>
      <PortfolioEntry />
    </Layout>
  );
}
