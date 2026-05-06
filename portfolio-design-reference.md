# Awwward-Winning Portfolio Design Reference Guide

> **Constraint:** Vanilla CSS + React. No external animation libraries.
> **Core Tools:** IntersectionObserver, CSS transforms, CSS gradients, `requestAnimationFrame`, CSS custom properties.

---

## Reference Sites (Dark Theme / Cinematic / Gradient-Heavy)

These sites embody the patterns below. Study their pacing, section transitions, and typographic scale:

| Site | Why It Matters |
|------|---------------|
| `obys.agency` | Dark brutalist agency. SOTD May 2026. Horizontal scroll sections, invasive typography, gradient cursor trails. |
| `studiodunbar.xyz` | Photographer-style minimalism. Split-screen layouts, cinematic parallax, large imagery. |
| `juanmora.co` | Dark UI dev portfolio. Glass cards, smooth scroll sections, tilt effects. |
| `rs69.dev` | Terminal/cyberpunk aesthetic. Mouse-tracking gradients, sticky scrolling layers. |
| `victorfuruya.com` | Photographer portfolio. Full-bleed hero, smooth scroll reveals, counter animations. |
| `375.studio` | Agency site. Vertical rhythm, staggered reveals, horizontal project carousels. |
| `sidewave.it` | Agency design. Parallax scrolling, gradient overlays, cinematic hero. |
| `silent-house.com` | Photography portfolio. Split-screen, large typography, subtle scroll animations. |
| `katherine-le.com` | Designer portfolio. Staggered scroll reveals, glass cards, scroll-driven color shifts. |
| `paodao.fr` | 3D/creative dev. Smooth scroll with sticky elements, immersive hero. |

---

## 1. Scroll-Triggered Reveal Animations

**Principle:** Elements slide in from left/right/up/down as they enter the viewport. Avoids stale static pages. Creates a "narrative scroll" where content reveals progressively.

**Technique:** `IntersectionObserver` + CSS `transform` + `transition`. Each element starts with `opacity: 0` and a translate offset. When the observer fires, a CSS class is added to animate to `opacity: 1; transform: translate(0, 0)`.

**CSS:**
```css
[data-reveal] {
  opacity: 0;
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-reveal="left"]   { transform: translateX(-60px); }
[data-reveal="right"]  { transform: translateX(60px); }
[data-reveal="up"]     { transform: translateY(40px); }
[data-reveal="down"]   { transform: translateY(-40px); }

[data-reveal].revealed { opacity: 1; transform: translate(0, 0); }

/* Stagger via CSS custom property (set inline per element) */
[data-reveal].revealed { transition-delay: var(--reveal-delay, 0ms); }
```

**React Hook (`useScrollReveal`):**
```jsx
import { useEffect, useRef } from 'react';

export function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -50px 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
```

**Usage in a component:**
```jsx
function Section() {
  const ref = useScrollReveal();

  return (
    <section ref={ref} data-reveal="left" style={{ '--reveal-delay': '100ms' }}>
      <h2>About Me</h2>
      <p>Content that slides in from the left</p>
    </section>
  );
}
```

**Design Principle:** Use staggered delays (`--reveal-delay`) to create cascading reveals. Content appears in sequence left-to-right, top-to-bottom. Never animate all items simultaneously — it feels mechanical. Use a custom cubic bezier (`0.16, 1, 0.3, 1`) for a "zoom out" feeling.

---

## 2. Parallax Effects

**Principle:** Foreground and background layers move at different speeds during scroll, creating depth. Photography portfolios use this heavily — portrait images drift slower than text overlays.

**Technique:** Use `transform: translateY()` driven by `requestAnimationFrame` synced to scroll position. Each layer has a multiplier. Background elements move slower (0.3–0.5x), foreground text moves faster (1.2x).

**CSS:**
```css
.parallax-section {
  position: relative;
  overflow: hidden;
  height: 100vh;
}

.parallax-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  will-change: transform;
  transform: translateY(calc(var(--scroll-offset) * 0.4));
}

.parallax-fg {
  position: relative;
  z-index: 1;
  transform: translateY(calc(var(--scroll-offset) * 0.15));
  will-change: transform;
}
```

**React Hook (`useParallax`):**
```jsx
import { useEffect, useRef, useCallback } from 'react';

export function useParallax(speed = 0.4) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const scrolled = window.innerHeight - rect.top;
      const offset = scrolled * speed;
      el.style.setProperty('--scroll-offset', `${offset}px`);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return ref;
}
```

**Usage:**
```jsx
function Hero() {
  const bgRef = useParallax(0.3);
  const fgRef = useParallax(0.6);

  return (
    <section className="parallax-section">
      <div ref={bgRef} className="parallax-bg" style={{ backgroundImage: 'url(/hero-bg.jpg)' }} />
      <div ref={fgRef} className="parallax-fg">
        <h1>Creative Developer</h1>
      </div>
    </section>
  );
}
```

**Alternative — CSS-only (no JS):**
```css
.parallax-wrapper {
  height: 100vh;
  overflow-y: auto;
  perspective: 1px;
  perspective-origin: top;
}

.parallax-layer {
  position: absolute;
  inset: 0;
}

.parallax-layer--back {
  transform: translateZ(-1px) scale(2);
}

.parallax-layer--base {
  transform: translateZ(0);
}
```
This uses `perspective` + `translateZ` to achieve parallax via scroll. The back layer appears to move slower because it's "further away" in 3D space. Gives smooth, GPU-accelerated parallax without any JavaScript.

---

## 3. Mouse-Tracking Gradient Backgrounds

**Principle:** A radial gradient or spotlight follows the cursor. Creates an immersive, reactive canvas. Used heavily by dark-theme portfolios.

**Technique:** Update CSS custom properties `--mouse-x` and `--mouse-y` on `mousemove`, then use them in a `radial-gradient()` background-positioned at the cursor coordinates.

**CSS:**
```css
.mouse-gradient {
  position: relative;
  overflow: hidden;
  background-color: #0a0a0f;
}

.mouse-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(99, 102, 241, 0.15),
    transparent 40%
  );
  pointer-events: none;
  z-index: 0;
}

.mouse-gradient > * {
  position: relative;
  z-index: 1;
}
```

**React Hook (`useMouseGradient`):**
```jsx
import { useEffect, useRef } from 'react';

export function useMouseGradient() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mouse-x', `${x}%`);
      el.style.setProperty('--mouse-y', `${y}%`);
    };

    el.addEventListener('mousemove', handleMove, { passive: true });
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return ref;
}
```

**Smoother variant using `requestAnimationFrame` lerp:**
```jsx
// Smooth tracking with interpolation for silkier feel
export function useSmoothMouseGradient() {
  const ref = useRef(null);
  const target = useRef({ x: 50, y: 50 });
  const current = useRef({ x: 50, y: 50 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      target.current.x = ((e.clientX - rect.left) / rect.width) * 100;
      target.current.y = ((e.clientY - rect.top) / rect.height) * 100;
    };

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      el.style.setProperty('--mouse-x', `${current.current.x}%`);
      el.style.setProperty('--mouse-y', `${current.current.y}%`);
      rafId = requestAnimationFrame(animate);
    };

    el.addEventListener('mousemove', handleMove, { passive: true });
    let rafId = requestAnimationFrame(animate);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return ref;
}
```

**Multi-layer variant (depth effect):**
```css
/* Layer 1: large, slow gradient */
.mouse-gradient::before {
  background: radial-gradient(
    800px circle at var(--mouse-x) var(--mouse-y),
    rgba(139, 92, 246, 0.12),
    transparent 50%
  );
  transition: background 0.3s ease;
}

/* Layer 2: smaller, sharper highlight — nested element */
.mouse-gradient .spotlight {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    250px circle at var(--mouse-x) var(--mouse-y),
    rgba(99, 102, 241, 0.25),
    transparent 30%
  );
  pointer-events: none;
}
```

---

## 4. Tilt-on-Hover Card Effects (Apple TV Style)

**Principle:** Cards tilt in 3D based on cursor position, with a glare/sheen layer. Responds to mouse proximity. Cards feel physical, premium.

**Technique:** On `mousemove`, calculate cursor offset from card center. Apply `rotateX` and `rotateY` proportionally. On `mouseleave`, reset to neutral with a smooth transition. Add a pseudo-element glare layer whose `transform` also shifts.

**CSS:**
```css
.tilt-card {
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.tilt-card.is-hovering {
  transition: transform 0.1s ease-out;
}

.tilt-card__glare {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle at var(--glare-x, 50%) var(--glare-y, 50%),
    rgba(255, 255, 255, 0.15) 0%,
    transparent 60%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.tilt-card:hover .tilt-card__glare {
  opacity: 1;
}
```

**React Hook (`useTilt`):**
```jsx
import { useRef, useEffect, useCallback } from 'react';

export function useTilt({ maxTilt = 10, scale = 1.02, glare = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;

    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt;
      const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      card.classList.add('is-hovering');

      if (glare) {
        const glareX = ((e.clientX - rect.left) / rect.width) * 100;
        const glareY = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--glare-x', `${glareX}%`);
        card.style.setProperty('--glare-y', `${glareY}%`);
      }
    };

    const handleLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.classList.remove('is-hovering');
    };

    card.addEventListener('mousemove', handleMove, { passive: true });
    card.addEventListener('mouseleave', handleLeave);

    return () => {
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
    };
  }, [maxTilt, scale, glare]);

  return ref;
}
```

**Usage:**
```jsx
function ProjectCard({ title, image }) {
  const tiltRef = useTilt({ maxTilt: 8, scale: 1.03 });

  return (
    <div ref={tiltRef} className="tilt-card">
      <div className="tilt-card__glare" />
      <img src={image} alt={title} />
      <h3>{title}</h3>
    </div>
  );
}
```

**Multi-layer tilt (depth cards):** Nest children with different `translateZ` values. On tilt, these move at different rates (similar to the Apple TV parallax icon effect):
```css
.tilt-card__image   { transform: translateZ(30px); }
.tilt-card__title   { transform: translateZ(50px); }
.tilt-card__button  { transform: translateZ(20px); }
```

---

## 5. Cinematic Hero Sections with Large Typography

**Principle:** The hero is the first impression. Full-viewport, dark background, massive typography (5–10vw), subtle text animations (letters/chars appear staggered), and a scroll-down indicator.

**Technique:** Large `clamp()` font sizes. Split text into characters for staggered entrance. Subtle vignette overlay. Text masking with background video.

**CSS:**
```css
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #050508;
  overflow: hidden;
}

.hero__title {
  font-size: clamp(3rem, 8vw, 10rem);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.03em;
  color: #f4f4f6;
  text-align: center;
}

/* Tight letter-spacing for impact, generous line-height for readability */
.hero__subtitle {
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-weight: 300;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(244, 244, 246, 0.6);
  margin-top: 1.5rem;
}

/* Vignette overlay — darkens edges, draws eye to center */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(5, 5, 8, 0.6) 100%
  );
  pointer-events: none;
}

/* Cinematic bars (letterbox) */
.hero__letterbox {
  position: absolute;
  left: 0;
  right: 0;
  height: clamp(40px, 8vh, 100px);
  background: #050508;
  z-index: 2;
}
.hero__letterbox--top    { top: 0; }
.hero__letterbox--bottom { bottom: 0; }
```

**Staggered character reveal (React component):**
```jsx
function RevealText({ text, className }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="reveal-char"
          style={{ animationDelay: `${i * 50 + 400}ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
```
```css
.reveal-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(40px);
  animation: charReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes charReveal {
  to { opacity: 1; transform: translateY(0); }
}
```

**Scroll indicator (subtle, not chevron-based):**
```css
.hero__scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.6;
}

.hero__scroll-line {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, #f4f4f6, transparent);
  animation: scrollLine 2s ease-in-out infinite;
}

@keyframes scrollLine {
  0%, 100% { transform: scaleY(1); transform-origin: top; }
  50%      { transform: scaleY(0.4); transform-origin: top; }
}
```

---

## 6. Smooth Scroll Sections with Sticky Elements

**Principle:** As the user scrolls through sections, key elements (image, heading, or decorative shape) remain sticky while content flows past. Creates visual anchors.

**Technique:** `position: sticky` for the visual element. Use `top` offset to control when it sticks. Pair with `IntersectionObserver` to swap images/text as sections scroll in.

**CSS:**
```css
.scroll-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  padding: 0 5vw;
  gap: 4rem;
  align-items: center;
}

.scroll-section__sticky {
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  height: fit-content;
}

.scroll-section__sticky img {
  width: 100%;
  border-radius: 12px;
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-section__content {
  padding: 100px 0;
}
```

**React — Sticky visual that swaps as sections enter:**
```jsx
function StickyShowcase({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observers = items.map((_, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.5 }
      );
      if (sectionRefs.current[i]) obs.observe(sectionRefs.current[i]);
      return obs;
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [items]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div className="scroll-section__sticky">
        <img
          src={items[activeIndex].image}
          alt={items[activeIndex].title}
          style={{ transition: 'opacity 0.4s ease, transform 0.4s ease' }}
        />
      </div>
      <div>
        {items.map((item, i) => (
          <div
            key={i}
            ref={(el) => (sectionRefs.current[i] = el)}
            style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}
          >
            <div style={{ opacity: activeIndex === i ? 1 : 0.3, transition: 'opacity 0.4s' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Horizontal Scroll Carousels for Project Showcases

**Principle:** Project showcase that scrolls horizontally, often pinned while the page continues to scroll vertically. Break free from vertical monotony.

**Technique:** Two approaches:
1. **CSS scroll-snap:** Pure CSS horizontal scroll with `overflow-x: auto` + `scroll-snap-type: x mandatory`.
2. **Scroll-driven horizontal translate:** Use `IntersectionObserver` + `requestAnimationFrame` to translate a container horizontally based on vertical scroll position within a pinned section.

**Approach 1 — CSS Scroll Snap (simpler):**
```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  gap: 2rem;
  padding: 0 calc((100vw - 80vw) / 2);
  scrollbar-width: none;
}

.carousel::-webkit-scrollbar { display: none; }

.carousel__item {
  flex: 0 0 80vw;
  scroll-snap-align: center;
  border-radius: 16px;
  overflow: hidden;
}
```

**Approach 2 — Vertical-to-Horizontal Scroll Pinning (more cinematic):**
```css
.horizontal-scroll-section {
  height: 300vh; /* 3x viewport for smooth scroll range */
  position: relative;
}

.horizontal-scroll-track {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.horizontal-scroll-container {
  display: flex;
  height: 100%;
  will-change: transform;
  /* Width = items * itemWidth + gaps */
}
```

```jsx
function HorizontalScrollSection({ items }) {
  const trackRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    const totalScroll = track.offsetHeight - window.innerHeight;

    const handleScroll = () => {
      const rect = track.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
      const maxTranslate = container.scrollWidth - window.innerWidth;
      container.style.transform = `translateX(${-progress * maxTranslate}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={trackRef} className="horizontal-scroll-section">
      <div className="horizontal-scroll-track">
        <div ref={containerRef} className="horizontal-scroll-container">
          {items.map((item) => (
            <div key={item.id} style={{ flex: '0 0 75vw', padding: '0 1rem' }}>
              <img src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Gradient Overlays and Glass-Morphism Cards

**Principle:** Cards float above backgrounds with frosted-glass blur. Gradient overlays on images create depth and mood. Used in project cards and CTA sections.

**Technique:** `backdrop-filter: blur()` on semi-transparent cards. `background: linear-gradient()` overlays on images. Combine with subtle border using `border: 1px solid rgba(255,255,255,0.1)`.

**CSS — Glass Card:**
```css
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2.5rem;
  overflow: hidden;
}

/* Subtle inner glow at top edge */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
}
```

**CSS — Gradient Image Overlay:**
```css
.image-overlay {
  position: relative;
}

.image-overlay img {
  display: block;
  width: 100%;
  border-radius: 16px;
}

.image-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(
    to top,
    rgba(5, 5, 8, 0.8) 0%,
    rgba(5, 5, 8, 0.2) 40%,
    transparent 70%
  );
}

/* Multi-stop gradient for cinematic color grade */
.cinematic-gradient::after {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.3) 0%,
    rgba(5, 5, 8, 0.4) 30%,
    rgba(139, 92, 246, 0.15) 70%,
    rgba(5, 5, 8, 0.8) 100%
  );
}
```

**CSS — Gradient Border Card (animated on hover):**
```css
.gradient-border-card {
  position: relative;
  border-radius: 16px;
  background: #0a0a10;
  padding: 2rem;
}

.gradient-border-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.3),
    rgba(139, 92, 246, 0.3),
    rgba(168, 85, 247, 0.3)
  );
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.gradient-border-card:hover::before {
  opacity: 1;
}
```

---

## 9. Counter Animations (Numbers Counting Up)

**Principle:** Statistics/numbers animate from 0 to their target value when scrolled into view. Creates a sense of trust and scale.

**Technique:** Use `IntersectionObserver` to trigger the animation. Use `requestAnimationFrame` with easing to count up from 0 to target. Update a state variable at 60fps.

**React Hook (`useCountUp`):**
```jsx
import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (startOnView) {
      const el = ref.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setStarted(true); },
        { threshold: 0.5 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;

    let startTime = null;
    let rafId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(target * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [started, target, duration]);

  return { count, ref };
}
```

**Usage:**
```jsx
function StatItem({ value, suffix, label }) {
  const { count, ref } = useCountUp(value, 2500);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6 }}>
        {label}
      </div>
    </div>
  );
}
```

**CSS tip:** Use `fontVariantNumeric: 'tabular-nums'` so the digits don't jump around as the number grows — this keeps the width stable.

---

## 10. Split-Screen Layouts

**Principle:** Left side = text content, right side = visual (image, illustration, 3D). Content alternates sides for visual rhythm. Very common in photography/designer portfolios.

**Technique:** CSS Grid `grid-template-columns: 1fr 1fr`. Use sticky positioning on the visual side. Alternate the row direction per section for visual pacing.

**CSS:**
```css
.split-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  align-items: center;
}

.split-section--reversed {
  direction: rtl;
}

.split-section--reversed > * {
  direction: ltr;
}

.split-section__text {
  padding: clamp(2rem, 8vw, 8rem);
  max-width: 600px;
}

.split-section__visual {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.split-section__visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Alternating sections: one text-left, next text-right */
.split-section:nth-child(even) .split-section__text {
  order: 1;
}
```

**React component:**
```jsx
function SplitSection({ title, description, image, reversed = false }) {
  return (
    <section className={`split-section ${reversed ? 'split-section--reversed' : ''}`}>
      <div className="split-section__text">
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem', opacity: 0.5 }}>
          {reversed ? '02' : '01'} — Project
        </span>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 5rem)', marginTop: '1rem' }}>{title}</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, opacity: 0.7, marginTop: '1.5rem' }}>{description}</p>
      </div>
      <div className="split-section__visual">
        <img src={image} alt={title} />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to ${reversed ? 'left' : 'right'}, rgba(10,10,18,0) 60%, rgba(10,10,18,1) 100%)`
        }} />
      </div>
    </section>
  );
}
```

**Asymmetric split (60/40 or 70/30):**
```css
.split-section--asymmetric {
  grid-template-columns: 3fr 2fr; /* 60% / 40% */
}
```

---

## Design Principles & Pacing

### Section Pacing (The "Awwwards Rhythm")

A portfolio should feel like a film:
1. **Hero** (100vh) — Brand statement, massive type, subtle motion
2. **Intro text** (60-80vh) — Who you are, brief, scroll reveals
3. **Selected work** — Split-screen or horizontal carousel (2-4 items)
4. **Process/Stats** — Counter animations, split sections
5. **Testimonials/CTA** — Glass cards, gradient backdrop
6. **Footer** — Minimal, links, gradient fade to black

### Typography System

```
Display: clamp(4rem, 8vw, 12rem) — Hero titles
H1:     clamp(2.5rem, 5vw, 6rem)   — Section headers
H2:     clamp(2rem, 3vw, 4rem)     — Project titles
Body:   1rem / 1.7                  — Descriptions
Label:  0.75rem, letter-spacing: 0.3em, uppercase — Meta text
```

Font pairings that work: **Display** (tight, dramatic, -0.03em letter-spacing) + **Body** (clean sans-serif). Popular picks: Druk, FK Grotesk, Satoshi, Cabinet Grotesk for display; Inter, Swiss, Aeonik for body.

### Color Strategy (Dark Theme)

```css
:root {
  --bg-primary:    #050508;   /* near-black */
  --bg-secondary:  #0a0a10;   /* dark card bg */
  --text-primary:  #f4f4f6;   /* off-white */
  --text-muted:    rgba(244, 244, 246, 0.5);
  --accent-1:      #6366f1;   /* indigo */
  --accent-2:      #8b5cf6;   /* violet */
  --accent-3:      #a855f7;   /* purple */
  --border:        rgba(255, 255, 255, 0.06);
  --glass-bg:      rgba(255, 255, 255, 0.04);
}
```

Gradient vocabulary:
```css
--gradient-primary: linear-gradient(135deg, #6366f1, #8b5cf6);
--gradient-hero:    linear-gradient(135deg, #0a0a10 0%, #1a1030 50%, #0f0a1a 100%);
--gradient-accent:  radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 70%);
```

### Performance Rules

1. **Always use `will-change`** on elements that transform/opacity on scroll
2. **Throttle scroll handlers** with `requestAnimationFrame` — use the `ticking` pattern
3. **`passive: true`** on scroll listeners
4. **GPU-composited properties only:** `transform` and `opacity` for animations (never animate `top`, `left`, `width`, `height`)
5. **Unobserve** IntersectionObserver targets after they've triggered (save CPU)
6. **`content-visibility: auto`** on below-the-fold sections for free rendering optimization
7. **Lazy images** with IntersectionObserver + `loading="lazy"`

### Global CSS Reset for Cinematic Dark Theme

```css
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  background: #050508;
  color: #f4f4f6;
  font-family: 'Inter', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  overflow-x: hidden;
}

img, video {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Selection style */
::selection {
  background: rgba(99, 102, 241, 0.4);
  color: #fff;
}

/* Custom scrollbar (optional, dark theme) */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #050508; }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
```

---

## Master Hook — `useScrollAnimation` (combines patterns 1, 2, 9)

A unified hook that handles reveal + parallax + count-up in one observer:

```jsx
import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation({
  reveal = false,
  parallax = false,
  parallaxSpeed = 0.3,
  countUp = false,
  countTarget = 0,
  countDuration = 2000,
} = {}) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onIntersect = () => {
      if (reveal) el.classList.add('revealed');
      if (countUp) {
        let start = null;
        const animate = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / countDuration, 1);
          setCount(Math.floor(countTarget * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { onIntersect(); observer.unobserve(el); } },
      { threshold: 0.15 }
    );

    const onScroll = () => {
      if (!parallax || ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--scroll-offset', `${(window.innerHeight - rect.top) * parallaxSpeed}px`);
        ticking.current = false;
      });
    };

    observer.observe(el);
    if (parallax) window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      if (parallax) window.removeEventListener('scroll', onScroll);
    };
  }, [reveal, parallax, parallaxSpeed, countUp, countTarget, countDuration]);

  return { ref, count };
}
```

---

## Quick Pattern Checklist for Implementation

| # | Pattern | Core Hook | CSS Key Property |
|---|---------|-----------|-----------------|
| 1 | Scroll reveals | `useScrollReveal` | `transform`, `opacity` |
| 2 | Parallax | `useParallax` | `transform: translateY()` |
| 3 | Mouse gradient | `useMouseGradient` | `radial-gradient()` |
| 4 | Tilt cards | `useTilt` | `transform: rotateX/Y` |
| 5 | Cinematic hero | `RevealText` component | `clamp()`, `@keyframes` |
| 6 | Sticky sections | IntersectionObserver | `position: sticky` |
| 7 | Horizontal scroll | Scroll-jacking + translateX | `scroll-snap-type` |
| 8 | Glass cards | (Pure CSS) | `backdrop-filter: blur()` |
| 9 | Counters | `useCountUp` | `fontVariantNumeric: tabular-nums` |
| 10 | Split screen | (Pure CSS) | `grid-template-columns: 1fr 1fr` |
