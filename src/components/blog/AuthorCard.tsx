interface AuthorCardProps {
  title?: string;
  date?: string;
  readingTime?: number;
  wordCount?: number;
  tags?: readonly { label: string; permalink: string }[];
}

export default function AuthorCard({ title, date, readingTime, wordCount, tags }: AuthorCardProps) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = title ? `${title} — Lam Hoang Cat Vy` : 'Lam Hoang Cat Vy — AI Systems Architect';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      const el = document.getElementById('copy-toast');
      if (el) {
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 2000);
      }
    });
  };

  return (
    <div className="author-card">
      <div className="author-card-inner">
        <div className="author-avatar-section">
          <img
            src="https://github.com/LamHoangCatVy.png"
            alt="Lam Hoang Cat Vy"
            className="author-avatar"
            loading="lazy"
          />
          <div className="author-info">
            <h4 className="author-name">Lam Hoang Cat Vy</h4>
            <p className="author-title">Senior AI Systems Architect</p>
          </div>
        </div>
        <div className="author-stats">
          {readingTime !== undefined && (
            <span className="author-stat">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 4v3.5L9.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {Math.ceil(readingTime)} min read
            </span>
          )}
          {wordCount !== undefined && (
            <span className="author-stat">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 6h4M5 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {wordCount.toLocaleString()} words
            </span>
          )}
        </div>
      </div>

      <div className="author-share-row">
        <span className="share-label">Share</span>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn"
          aria-label="Share on LinkedIn"
        >
          <i className="fab fa-linkedin-in" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn"
          aria-label="Share on X"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M10.5 1.5h2.07L8.57 6.1l4.72 6.4H9.3l-3.27-4.27L2.3 12.5H.23l4.85-5.54L.5 1.5h4.14l2.96 3.9 2.9-3.9zM9.82 11.38h1.15L3.95 2.56H2.7l7.12 8.82z" />
          </svg>
        </a>
        <button onClick={copyLink} className="share-btn" aria-label="Copy link">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="5" y="5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 9V3a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span id="copy-toast" className="copy-toast">Link copied</span>
      </div>

      {tags && tags.length > 0 && (
        <div className="author-tags">
          {tags.map((tag) => (
            <a key={tag.permalink} href={tag.permalink} className="author-tag">
              {tag.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
