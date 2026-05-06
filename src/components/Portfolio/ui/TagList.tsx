import type { ReactNode } from 'react';

interface TagListProps {
  tags?: string[];
  className?: string;
}

export function TagList({ tags, className = '' }: TagListProps) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center text-[10px] font-mono px-3 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10 uppercase"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

interface SocialLinkProps {
  href: string;
  icon: string;
}

export function SocialLink({ href, icon }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 hover:border-[#00f3ff]/30 transition-all"
    >
      <i className={`${icon} text-lg`} />
    </a>
  );
}

interface SectionCardProps {
  children: ReactNode;
  className?: string;
}

export function SectionCard({ children, className = '' }: SectionCardProps) {
  return (
    <div className={`bg-[#0a0c12]/70 backdrop-blur-xl border border-white/5 rounded-2xl p-8 md:p-12 mb-10 ${className}`}>
      {children}
    </div>
  );
}

interface TimelineDotProps {
  color?: string;
  shadowColor?: string;
}

export function TimelineDot({ color = 'gray', shadowColor = 'gray' }: TimelineDotProps) {
  return (
    <span
      className="before:content-[''] before:absolute before:-left-[7px] before:top-1.5 before:w-3 before:h-3 before:rounded-full"
      style={{
        // @ts-expect-error - CSS custom properties
        '--dot-color': color,
        '--dot-shadow': shadowColor,
      }}
    />
  );
}
