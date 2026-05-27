import { useState, useEffect } from 'react';
import { CustomCursor, LoadingScreen, NoiseOverlay } from './ui';
import ScrollPortfolio from './views/ScrollPortfolio';

export default function PortfolioApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('portfolio-page');
    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
      html.classList.remove('portfolio-page');
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!document.getElementById('fa-link')) {
      const link = document.createElement('link');
      link.id = 'fa-link';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('fonts-link')) {
      const link = document.createElement('link');
      link.id = 'fonts-link';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap';
      document.head.appendChild(link);
    }
    if (!document.getElementById('chartjs-script')) {
      const script = document.createElement('script');
      script.id = 'chartjs-script';
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <>
      <NoiseOverlay />
      <CustomCursor />
      {loading && <LoadingScreen />}
      <ScrollPortfolio />
    </>
  );
}
