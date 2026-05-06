import { useEffect, useRef } from 'react';
import type { Mode } from '../data/constants';
import { NODE_COLORS } from '../data/constants';
import { SocialLink, SectionCard } from '../ui';

interface StoryViewProps {
  visible: boolean;
  onSwitchToMode: (mode: Mode) => void;
}

export default function StoryView({ visible, onSwitchToMode }: StoryViewProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible) return;
    const ctx = chartRef.current;
    if (!ctx || !window.Chart) return;

    const ChartJS = window.Chart;
    let chartStatus = ChartJS.getChart('skillsRadar');
    if (chartStatus) chartStatus.destroy();

    new ChartJS(ctx, {
      type: 'radar',
      data: {
        labels: ['AI Architecture', 'Cloud (AWS)', 'Analysis', 'Product Mgmt', 'Leadership', 'Integration'],
        datasets: [{
          data: [95, 90, 95, 85, 80, 85],
          backgroundColor: 'rgba(0, 243, 255, 0.1)',
          borderColor: '#00f3ff',
          borderWidth: 1,
          pointBackgroundColor: '#fff',
          pointRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            angleLines: { color: 'rgba(255,255,255,0.1)' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            pointLabels: { color: '#888', font: { family: 'JetBrains Mono', size: 10 } },
            ticks: { display: false },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }, [visible]);

  const timelineEntries = [
    {
      color: '#bc13fe',
      shadow: '#bc13fe',
      title: 'Senior Business Systems Analyst',
      subtitle: '+ IT Young Talents Program Manager @ my company',
      date: 'Aug 2024 - Present',
      details: [
        { label: 'As PO & BA:', text: 'Define vision and roadmap for internal GenAI tools. Prioritize backlogs and facilitate workshops to drive self-service AI adoption.' },
        { label: 'As AI Architect:', text: 'Architected high-performance technical solutions for Agentic RAG systems. Defined scalable workflows for the CAIP platform bankwide.' },
        { label: 'As Program Manager:', text: 'Redesigned IT Young Talent recruitment into a "4-Step Funnel". Integrated mentorship into official KPIs.' },
      ],
    },
    {
      color: '#00f3ff',
      shadow: '#00f3ff',
      title: 'Cloud Engineer',
      subtitle: 'Cloud Kinetics Vietnam',
      date: 'Jun 2024 - Aug 2024',
      bullets: [
        '<strong>AWS Migration:</strong> Assisted Pre-Sales in Azure-to-AWS migration; mapped infrastructure, prepared BOM ($8K+ MRR).',
        '<strong>Telecom RAG:</strong> Created AWS setup guides for Amazon Bedrock chatbots and drafted SOW for international clients.',
      ],
    },
    {
      color: 'gray',
      shadow: 'gray',
      title: 'External Relations Manager',
      subtitle: 'The Psymics (US Embassy Project)',
      date: 'Jul 2021 - Feb 2022',
      bullets: [
        'Started a fan-page from 0 to over 5K followers in 3 months.',
        'Hosted events with US Embassy & Thailand Embassy delivering speeches about cyberbullying.',
      ],
    },
    {
      color: 'gray',
      shadow: 'gray',
      title: 'Head of Marketing',
      subtitle: 'The Patronous',
      date: 'Feb 2021 - Jul 2021',
      text: 'Developed sponsorship proposals, managed post campaigns, and hosted events for teenagers aimed at realizing stress.',
    },
    {
      color: 'gray',
      shadow: 'gray',
      title: 'Graphic Designer',
      subtitle: 'The Middle Man NGO',
      date: 'Aug 2019 - Jun 2020',
      text: 'Designed Facebook posts to attract target demographics. Engaged deeply in team brainstorming to release fresh ideas.',
    },
  ];

  const skillTags = ['Agentic RAG', 'AWS Ecosystem', 'Business Architecture', 'Strategic Leadership'];

  return (
    <div
      className={`absolute inset-0 z-20 overflow-y-auto overflow-x-hidden transition-opacity duration-500 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-[1000px] mx-auto px-6 pt-32 pb-32">
        {/* Hero */}
        <div className="min-h-[70vh] flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tight mb-6">
            LAM HOANG<br />
            <span className="text-[#00f3ff]">CAT VY.</span>
          </h1>
          <p className="font-mono text-sm text-gray-400 tracking-[0.2em] mb-10 uppercase">
            Senior AI Systems Architect
          </p>
          <div className="flex gap-4 pointer-events-auto">
            <SocialLink href="https://linkedin.com/in/lam-hoang-cat-vy" icon="fab fa-linkedin-in" />
            <SocialLink href="mailto:catvyisstudying@gmail.com" icon="fas fa-envelope" />
          </div>
        </div>

        {/* Origin */}
        <SectionCard>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-6">The Origin & Architecture</h2>
          <p className="text-gray-300 leading-relaxed mb-6 font-light text-lg">
            Experienced <strong>Senior AI Systems Architect</strong> with deep expertise in Generative AI, cloud-native development, and enterprise-scale system integration.
            I bridge the gap between non-technical business units and development teams. My superpower is <strong>Translation</strong>: converting "Business Goals" into robust "System Logic" without losing nuance.
          </p>
          <h3 className="font-mono text-xs text-[#00f3ff] tracking-widest mb-4 uppercase">Competency Matrix</h3>
          <div className="w-full h-[350px] relative">
            <canvas ref={chartRef} id="skillsRadar" />
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {skillTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center text-[11px] font-mono px-3 py-1.5 rounded bg-white/5 text-gray-300 border border-white/10 uppercase"
              >
                {t}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Career Timeline */}
        <SectionCard>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-10">Full Career Logs</h2>

          {timelineEntries.map((entry, i) => (
            <div
              key={i}
              className={`border-l-2 border-white/10 pl-6 md:pl-8 ${i < timelineEntries.length - 1 ? 'mb-12' : ''} relative`}
            >
              <span
                className="before:content-[''] before:absolute before:-left-[7px] before:top-1.5 before:w-3 before:h-3 before:rounded-full"
                style={{
                  backgroundColor: entry.color,
                  boxShadow: `0 0 10px ${entry.shadow}`,
                  position: 'absolute',
                  left: '-7px',
                  top: '6px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                }}
              />
              <div className="flex flex-col md:flex-row justify-between md:items-end mb-1">
                <h3 className="text-2xl font-bold tracking-tight text-white">{entry.title}</h3>
                <span className="font-mono text-xs text-gray-500 mt-2 md:mt-0">{entry.date}</span>
              </div>
              <div
                className={`font-mono text-sm mb-5`}
                style={{ color: entry.color === 'gray' ? '#888' : entry.color }}
              >
                {entry.subtitle}
              </div>

              {entry.details ? (
                <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                  {entry.details.map((d, idx) => (
                    <p key={idx}>
                      <strong className="text-white">{d.label}</strong> {d.text}
                    </p>
                  ))}
                </div>
              ) : entry.bullets ? (
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                  {entry.bullets.map((b, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: b }} />
                  ))}
                </ul>
              ) : entry.text ? (
                <p className="text-sm text-gray-300">{entry.text}</p>
              ) : null}
            </div>
          ))}

          {/* CTA to Knowledge Hub */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = '/knowledge-hub/intro';
            }}
            className="mt-16 p-8 bg-[#bc13fe]/10 border border-[#bc13fe]/30 rounded-xl text-center cursor-pointer transition-all duration-300 hover:bg-[#bc13fe]/20 pointer-events-auto group"
          >
            <i className="fas fa-brain text-[#bc13fe] text-3xl mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold tracking-tight text-white text-2xl">Explore The Knowledge Hub</h3>
            <p className="text-gray-400 mt-2 max-w-lg mx-auto">
              Dive into my technical documentation covering LLM Engineering, Cloud Architecture, Systems Design, and AI Security.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
