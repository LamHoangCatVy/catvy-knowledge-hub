import { useState } from 'react';

interface AccordionProps {
  icon: string;
  title: string;
  content: string;
  color: string;
}

export default function Accordion({ icon, title, content, color }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <div
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderBottom: isOpen ? '1px solid rgba(255,255,255,0.05)' : 'none',
          backgroundColor: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent',
        }}
      >
        <span className="accordion-title" style={{ color }}>
          <i className={`${icon} mr-2`} /> {title}
        </span>
        <i
          className={`fas fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: isOpen ? color : 'rgba(255,255,255,0.4)' }}
        />
      </div>
      <div className={`accordion-body ${isOpen ? 'accordion-open' : 'accordion-closed'}`}>
        <div
          className="accordion-content"
          style={{ borderColor: color, backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
