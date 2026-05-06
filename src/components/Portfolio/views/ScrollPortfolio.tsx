import { useEffect, useRef, useState } from 'react';
import { useMouseGradient } from '../hooks/useMouseGradient';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useParallax } from '../hooks/useParallax';
import { useTilt } from '../hooks/useTilt';
import { useCountUp } from '../hooks/useCountUp';
import { SocialLink } from '../ui';
import { PROJECTS_DATA } from '../data/projects';
import '@site/src/css/portfolio-scroll.css';

const FEATURED_PROJECT_IDS = [
  'proj_1', 'proj_2', 'proj_3', 'proj_4', 'proj_5', 'proj_7',
];

const PROJECT_SHOWCASE_MAP: Record<string, string> = {
  proj_1: 'ezpolicy',
  proj_2: 'aml-chatbot',
  proj_3: 'arxiv-assistant',
  proj_4: 'droppii-migration',
  proj_5: 'prompt-security-gate',
  proj_7: 'it-young-talents',
};

const PROJECT_COLORS: Record<string, { color: string; icon: string }> = {
  proj_1: { color: '#00f3ff', icon: 'fas fa-file-alt' },
  proj_2: { color: '#ff0055', icon: 'fas fa-shield-alt' },
  proj_3: { color: '#bc13fe', icon: 'fas fa-cogs' },
  proj_4: { color: '#00ff88', icon: 'fas fa-comments' },
  proj_5: { color: '#ffaa00', icon: 'fas fa-cloud-upload-alt' },
  proj_7: { color: '#00f3ff', icon: 'fas fa-flask' },
};

function HeroSection() {
  const gradientRef = useMouseGradient();
  const titleRef = useParallax(0.08);

  return (
    <section className="hero-section hero-gradient" ref={gradientRef} id="section-hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <h1 className="hero-name">
          <span className="hero-name-line">LAM HOANG</span>
          <span className="hero-name-line">CAT VY.</span>
        </h1>
        <p className="hero-title" ref={titleRef}>
          Senior AI Systems Architect
        </p>
        <div className="flex justify-center gap-4 mt-10">
          <SocialLink href="https://linkedin.com/in/lam-hoang-cat-vy" icon="fab fa-linkedin-in" />
          <SocialLink href="mailto:catvyisstudying@gmail.com" icon="fas fa-envelope" />
        </div>
      </div>
      <div className="hero-scroll-indicator">
        <span>Scroll</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}

function DesignerToArchitectSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.querySelectorAll('.reveal-left, .reveal-right').forEach((c) => c.classList.add('revealed'));
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="portfolio-section" ref={sectionRef} id="section-origin">
      <div className="split-section">
        <div className="split-text">
          <div className="reveal-left">
            <div className="section-label">Chapter I</div>
            <h2>From Graphic Designer to AI Architect</h2>
            <p>
              Five roles before twenty-five. Each chapter built the next. Visual communication taught me empathy
              for the user. Community leadership taught me stakeholder psychology. Cloud engineering taught me
              systems thinking. Now, as an AI Architect, I translate business ambition into systems that actually work.
            </p>
            <p>
              The thread connecting every role: <strong className="text-[#00f3ff]">translation</strong>.
              Converting vision to logic. Requirements to architecture. Ideas to infrastructure.
            </p>
          </div>
        </div>
        <div className="split-visual reveal-right">
          <div className="split-visual-bg" />
          <div className="split-visual-content">
            <i className="fas fa-route" />
            <h3>Non-linear paths make the best architects</h3>
            <p>Graphic Design → Community → Cloud → AI</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TranslatorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { count: projCount, ref: projRef } = useCountUp(PROJECTS_DATA.length, 1200);
  const { count: caseCount, ref: caseRef } = useCountUp(100, 1500);
  const { count: certCount, ref: certRef } = useCountUp(8, 1000);
  const { count: commCount, ref: commRef } = useCountUp(8, 1000);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.querySelectorAll('.reveal-up').forEach((c) => c.classList.add('revealed'));
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="portfolio-section" ref={sectionRef} id="section-translator">
      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <div className="gradient-card reveal-up">
          <div className="section-label">Chapter II</div>
          <h2>The Translator</h2>
          <p className="gradient-card-quote">
            My superpower is <strong>translation</strong> — converting business goals into robust system logic
            without losing nuance. I bridge the gap between non-technical stakeholders and engineering teams,
            ensuring what gets built is what the business actually needs.
          </p>
        </div>

        <div className="stat-grid reveal-up" style={{ transitionDelay: '0.2s' }}>
          <div className="stat-card">
            <span className="stat-number" ref={projRef}>{projCount}</span>
            <div className="stat-label">Enterprise Projects</div>
          </div>
          <div className="stat-card">
            <span className="stat-number" ref={caseRef}>{caseCount}+</span>
            <div className="stat-label">AI Use Cases</div>
          </div>
          <div className="stat-card">
            <span className="stat-number" ref={certRef}>{certCount}</span>
            <div className="stat-label">Certifications</div>
          </div>
          <div className="stat-card">
            <span className="stat-number" ref={commRef}>{commCount}</span>
            <div className="stat-label">Community Contributions</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompetencySection() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.querySelectorAll('.reveal-up').forEach((c) => c.classList.add('revealed'));
          initChart();
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function initChart() {
    const ctx = chartRef.current;
    if (!ctx || !window.Chart) return;
    const ChartJS = window.Chart;
    const existing = ChartJS.getChart('skillsRadar');
    if (existing) existing.destroy();

    new ChartJS(ctx, {
      type: 'radar',
      data: {
        labels: ['AI Architecture', 'Cloud (AWS)', 'Systems Analysis', 'Product Mgmt', 'Leadership', 'Integration'],
        datasets: [{
          data: [95, 90, 95, 85, 80, 85],
          backgroundColor: 'rgba(0, 243, 255, 0.08)',
          borderColor: '#00f3ff',
          borderWidth: 1.5,
          pointBackgroundColor: '#fff',
          pointRadius: 3,
          pointBorderColor: '#00f3ff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100,
            angleLines: { color: 'rgba(255,255,255,0.06)' },
            grid: { color: 'rgba(255,255,255,0.04)' },
            pointLabels: { color: '#888', font: { family: 'JetBrains Mono', size: 10 } },
            ticks: { display: false },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  const skills = [
    'Agentic RAG', 'LangChain', 'AWS Ecosystem', 'Kubernetes', 'Terraform',
    'System Design', 'Prompt Engineering', 'LLM Evaluation', 'Stakeholder Mgmt', 'Agile Delivery',
  ];

  return (
    <section className="portfolio-section" ref={sectionRef} id="section-competency">
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div className="section-header reveal-up">
          <div className="section-label">Chapter III</div>
          <h2>Competency Matrix</h2>
        </div>

        <div className="radar-wrapper reveal-up" style={{ transitionDelay: '0.15s' }}>
          <canvas ref={chartRef} id="skillsRadar" />
        </div>

        <div className="tags-cloud reveal-up" style={{ transitionDelay: '0.3s' }}>
          {skills.map((skill) => (
            <span key={skill} className="tag-pill">{skill}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProjectsSection() {
  const sectionRef = useScrollReveal('.reveal-up');

  return (
    <section className="portfolio-section" ref={sectionRef} id="section-projects">
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div className="section-header reveal-up">
          <div className="section-label">Chapter IV</div>
          <h2>Featured Projects</h2>
        </div>

        <div className="project-carousel">
          {FEATURED_PROJECT_IDS.map((id) => {
            const project = PROJECTS_DATA.find((p) => p.id === id);
            if (!project) return null;
            const meta = PROJECT_COLORS[id] || { color: '#888', icon: 'fas fa-code' };

            return <div className="project-carousel-card" key={id}><ProjectCard project={project} color={meta.color} icon={meta.icon} /></div>;
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, color, icon }: { project: typeof PROJECTS_DATA[0]; color: string; icon: string }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(8, 600);

  return (
    <div
      ref={ref}
      className="project-tilt-card reveal-up"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => { const sid = PROJECT_SHOWCASE_MAP[project.id] || project.id; window.location.href = `/project/${sid}`; }}
    >
      <div className="project-card-icon" style={{ color }}>
        <i className={icon} />
      </div>
      <span className="project-card-tag" style={{ borderColor: color, color }}>
        {project.role}
      </span>
      <h4 className="project-card-title">{project.title}</h4>
      <p className="project-card-desc">{project.subtitle}</p>
      <div className="project-card-tech">
        {project.tags.slice(0, 3).map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function CareerTimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.querySelectorAll('.reveal-left, .reveal-right').forEach((c) => c.classList.add('revealed'));
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const entries = [
    { color: '#bc13fe', title: 'Senior Business Systems Analyst', company: 'my company', date: 'Aug 2024 – Present', desc: 'PO & AI Architect for enterprise GenAI tools. Designed Agentic RAG systems. Program Manager for IT Young Talents.' },
    { color: '#00f3ff', title: 'Cloud Engineer', company: 'Cloud Kinetics Vietnam', date: 'Jun 2024 – Aug 2024', desc: 'Azure-to-AWS migration. Telecom RAG chatbot with Amazon Bedrock. Pre-sales SOW drafting.' },
    { color: '#ffaa00', title: 'External Relations Manager', company: 'The Psymics (US Embassy)', date: 'Jul 2021 – Feb 2022', desc: 'Built audience from 0 to 5K in 3 months. Hosted cyberbullying awareness events with embassies.' },
    { color: '#00ff88', title: 'Head of Marketing', company: 'The Patronous', date: 'Feb 2021 – Jul 2021', desc: 'Sponsorship proposals and post campaigns. Hosted mental health events for teenagers.' },
    { color: '#888', title: 'Graphic Designer', company: 'The Middle Man NGO', date: 'Aug 2019 – Jun 2020', desc: 'Designed social media content. Engaged in brainstorming for fresh visual concepts and templates.' },
  ];

  return (
    <section className="portfolio-section" ref={sectionRef} id="section-timeline">
      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div className="section-header reveal-up">
          <div className="section-label">Chapter V</div>
          <h2>Career Timeline</h2>
        </div>

        <div className="timeline">
          {entries.map((entry, i) => (
            <div key={i} className={`timeline-entry ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}>
              <div className="timeline-dot" style={{ backgroundColor: entry.color }} />
              <div className="timeline-card">
                <h4>{entry.title}</h4>
                <div className="timeline-date">{entry.date}</div>
                <div className="timeline-company" style={{ color: entry.color }}>
                  {entry.company}
                </div>
                <p>{entry.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExploreCTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.querySelectorAll('.reveal-up').forEach((c) => c.classList.add('revealed'));
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="portfolio-section" ref={sectionRef}>
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div className="section-header reveal-up">
          <div className="section-label">Explore</div>
          <h2>Continue the Journey</h2>
        </div>

        <div className="cta-grid">
          <div
            className="cta-card cta-card-knowledge reveal-up"
            style={{ transitionDelay: '0.1s' }}
            onClick={() => { window.location.href = '/knowledge-hub/intro'; }}
          >
            <div className="cta-card-icon">
              <i className="fas fa-brain" style={{ color: '#bc13fe' }} />
            </div>
            <h3>Knowledge Hub</h3>
            <p>Technical deep-dives on LLM Engineering, Cloud Architecture, Systems Design, and AI Security.</p>
          </div>

          <div
            className="cta-card cta-card-blog reveal-up"
            style={{ transitionDelay: '0.2s' }}
            onClick={() => { window.location.href = '/blog'; }}
          >
            <div className="cta-card-icon">
              <i className="fas fa-pen-fancy" style={{ color: '#00ff88' }} />
            </div>
            <h3>Read the Blog</h3>
            <p>Stories from the trenches — Agentic RAG, cloud migrations, open source AI, and career lessons.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ScrollPortfolio() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: 'hero', label: 'Hero' },
    { id: 'origin', label: 'Origin' },
    { id: 'translator', label: 'Translator' },
    { id: 'competency', label: 'Matrix' },
    { id: 'projects', label: 'Projects' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'explore', label: 'Explore' },
  ];

  useEffect(() => {
    const container = document.getElementById('portfolio-scroll');
    if (!container) return;

    const sectionEls = container.querySelectorAll('.portfolio-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(sectionEls).indexOf(entry.target as Element);
            if (idx >= 0) setActiveSection(idx);
          }
        });
      },
      { threshold: 0.4 }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div id="portfolio-scroll" className="absolute inset-0 z-20 overflow-y-auto overflow-x-hidden" style={{ scrollSnapType: 'y proximity', scrollBehavior: 'smooth', paddingTop: 60 }}>
      {/* Dot navigation */}
      <div className="section-dots">
        {sections.map((s, i) => (
          <button
            key={s.id}
            className={`section-dot ${i === activeSection ? 'active' : ''}`}
            onClick={() => {
              document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label={s.label}
          >
            <span className="section-dot-tooltip">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Chapter label */}
      <div className={`chapter-label ${activeSection > 0 ? 'visible' : ''}`}>
        {activeSection > 0 ? `Chapter ${activeSection} · ${sections[activeSection]?.label}` : ''}
      </div>

      <HeroSection />
      <DesignerToArchitectSection />
      <TranslatorSection />
      <CompetencySection />
      <FeaturedProjectsSection />
      <CareerTimelineSection />
      <ExploreCTASection />
    </div>
  );
}
