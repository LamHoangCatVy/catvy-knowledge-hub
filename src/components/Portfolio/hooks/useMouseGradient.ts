import { useEffect, useRef } from 'react';

export function useMouseGradient(elementRef?: React.RefObject<HTMLElement | null>) {
  const gradientRef = useRef<HTMLDivElement>(null);
  const targetRef = elementRef || gradientRef;

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    };

    el.addEventListener('mousemove', onMouseMove);
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');

    return () => el.removeEventListener('mousemove', onMouseMove);
  }, [targetRef]);

  return gradientRef;
}
