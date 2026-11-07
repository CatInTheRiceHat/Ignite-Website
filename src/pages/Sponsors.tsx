import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { RedirectArrow } from '../components/ui/redirect-arrow';
import { PARTNERSHIP_MEETING_URL } from '../lib/links';
import './sponsors.css';

const ART = '/sponsors/sponsorship/';
const ART_REVISION = '20261106-2046';
const art = (name: string) => `${ART}${encodeURIComponent(name)}?v=${ART_REVISION}`;
const tiers = [
  { name: 'Ember', temperature: 'Red hot', range: '$250–$999', color: '#F5A49B', description: 'Every bright future begins with a little spark. Help Ignite develop free, approachable learning resources that invite students to explore their interests, try something new, and take their first steps toward practical life skills.' },
  { name: 'Flare', temperature: 'Orange hot', range: '$1,000–$4,999', color: '#FFBC87', description: 'Give a growing spark the space to shine. Support Ignite’s work on hands-on lessons and activities that connect learning with everyday life, helping students practice new skills and discover what they can do.' },
  { name: 'Solaris', temperature: 'Golden hot', range: '$5,000–$9,999', color: '#F8DB8A', description: 'Help light the way for more students. Support the development of practical learning experiences that encourage curiosity, build confidence, and give young people room to ask questions, explore possibilities, and learn by doing.' },
  { name: 'Cobalt', temperature: 'Blue hot', range: '$10,000–$49,999', color: '#9DBFF2', description: 'Bring a brighter horizon within reach. Help strengthen the lessons, resources, and learning experiences behind Ignite’s free education mission, supporting a student-led effort to make practical skills more approachable for the next generation.' },
  { name: 'Nova', temperature: 'Purple hot', range: '$50,000+', color: '#CEB9F3', description: 'Founding Sponsor' },
] as const;
const stops = [0, 0.25, 0.44, 0.64, 0.96];
const NOVA_SCALE = 2;
const MASCOT_SCALES = [1, 1.25, 1.55, 1.9, 1];
const miniatureStops = [82, 67, 55, 37, 15];
const tierAt = (progress: number) => progress < 0.155 ? 0 : progress < 0.345 ? 1 : progress < 0.54 ? 2 : progress < 0.79 ? 3 : 4;

function mascotLayout(width: number, height: number, index = 0) {
  const mobile = width < 640;
  const compact = width <= 900 || height <= 600;
  const originalSize = Math.min(width * (mobile ? 0.44 : compact ? 0.30 : 0.32), height * (mobile ? 0.34 : compact ? 0.36 : 0.41));
  const gap = mobile ? 12 : Math.max(48, Math.min(width * 0.04, 80));
  const cardWidth = width <= 900 ? width * 0.26 : Math.min(width * 0.26, 340);
  const glassWidth = Math.min(width * 0.9, height * 0.46);
  // Ember sits beside the bulb; the higher tiers sit beside the narrower stem.
  const bodyHalf = glassWidth * (index === 0 ? 0.5 : 247 / (2 * 514));
  // Keep both columns inside the frame, reserving the same gap on each side.
  const innerOffset = Math.min(bodyHalf + gap, width * 0.47 - cardWidth);
  const available = mobile ? width * 0.56 - gap : width * 0.47 - innerOffset;
  const largestSize = Math.max(originalSize, Math.min(originalSize * MASCOT_SCALES[3], available));
  // Preserve Ember's original size and apply the available growth above it.
  const growth = (largestSize - originalSize) / (MASCOT_SCALES[3] - 1);
  const size = index === 4 ? originalSize : originalSize + growth * (MASCOT_SCALES[index] - 1);
  const left = mobile ? width * 0.02 : width / 2 - innerOffset - size - 16;
  // Mirror the mascot's inner edge across the thermometer for equal spacing.
  const cardLeft = width - left - size;
  const miniRight = Math.max(44, Math.min(width * 0.04, 64));
  // Account for the transparent padding around the small thermometer's artwork.
  const miniLeft = width - miniRight - 27 - 240 * 256 / 2995;
  const mainGap = cardLeft - (width / 2 + bodyHalf);
  const expandedCardWidth = width > 900 && index > 0 && index < 4
    ? Math.max(cardWidth, miniLeft - mainGap - cardLeft)
    : cardWidth;
  return { size, left, cardLeft, cardWidth: expandedCardWidth };
}

function geometry(width: number, height: number) {
  const glassWidth = Math.min(width * 0.9, height * 0.46);
  const top = height * 0.77;
  const imageScale = glassWidth / 514;
  const glassHeight = 2339 * imageScale;
  const world = top + glassHeight + height * 0.06;
  const novaY = Math.max(height * (width < 640 ? 0.34 : 0.49), mascotLayout(width, height, 4).size + 64) - 20;
  const anchors = [world - height * 0.4, top + 1682 * imageScale, top + 1322 * imageScale, top + 772 * imageScale, novaY];
  return { world, glassWidth, glassHeight, imageScale, top, anchors };
}

function cameraAt(progress: number, width: number, height: number) {
  progress = Math.max(0, Math.min(1, progress));
  const { world, anchors } = geometry(width, height);
  const times = [0, 0.06, 0.25, 0.44, 0.64, 0.80, 0.92, 1];
  const positions = [height - world, height - world, height * 0.5 - anchors[1], height * 0.5 - anchors[2], height * 0.5 - anchors[3], -height * 0.23, 0, 0];
  const index = Math.min(times.length - 2, Math.max(0, times.findIndex((_, i) => i < times.length - 1 && progress <= times[i + 1])));
  const t = Math.min(1, Math.max(0, (progress - times[index]) / (times[index + 1] - times[index])));
  const eased = index === 5 ? 1 - Math.pow(1 - t, 3) : t;
  return positions[index] + (positions[index + 1] - positions[index]) * eased;
}

function Glass({ width, height }: { width: number; height: number }) {
  const { imageScale, top } = geometry(width, height);
  return <div className="sponsor-glass" style={{ top: top - 328 * imageScale, width: 1536 * imageScale, height: 2995 * imageScale }} aria-hidden="true">
    <img src={art('Thermometer.png')} width="1536" height="2995" alt="" draggable="false" />
  </div>;
}

function Tier({ index, active, layer, anchor, width, height, progress, reduced }: {
  index: number; active: number; layer: 'mascot' | 'copy'; anchor: number; width: number; height: number; progress: MotionValue<number>; reduced: boolean;
}) {
  const tier = tiers[index];
  const nova = index === 4;
  const visible = index === active;
  const [emerged, setEmerged] = useState(false);
  const layout = mascotLayout(width, height, index);
  const top = layer === 'mascot' && index === 0
    ? geometry(width, height).world - height * 0.1 - layout.size / 2
    : anchor;
  const fromX = nova || reduced ? 0 : width / 2 - layout.left - layout.size / 2;
  const fromY = nova && !reduced ? height * 0.16 : 0;
  const scale = useTransform(progress, [0, 0.79, 0.94, 1], reduced ? [NOVA_SCALE, NOVA_SCALE, NOVA_SCALE, NOVA_SCALE] : [1, 1, NOVA_SCALE, NOVA_SCALE]);
  useEffect(() => { if (!visible) setEmerged(false); }, [visible]);

  return <section className={`${layer === 'mascot' ? 'sponsor-character' : 'sponsor-tier'} ${nova ? 'sponsor-tier--nova' : ''}`} style={{ top, '--tier-color': tier.color, '--mascot-size': `${layout.size}px`, '--card-left': !nova && width >= 640 ? `${layout.cardLeft}px` : undefined, '--card-width': !nova && width > 900 ? `${layout.cardWidth}px` : undefined, zIndex: layer === 'mascot' ? !nova && emerged ? 4 : 2 : undefined } as CSSProperties} aria-hidden={layer === 'mascot' || undefined} aria-labelledby={layer === 'copy' ? `tier-${tier.name.toLowerCase()}` : undefined}>
    {layer === 'mascot' ? <div className="sponsor-mascot-position" style={nova ? undefined : { left: layout.left }} aria-hidden="true">
      <motion.div style={nova ? { scale } : undefined} initial={{ x: fromX, y: fromY }} animate={{ x: visible ? 0 : fromX, y: visible ? 0 : fromY }} onAnimationComplete={() => { if (visible) setEmerged(true); }} transition={{ duration: reduced ? 0 : nova ? 1.25 : 0.95, ease: [0.22, 1, 0.36, 1] }}>
        <motion.div className="sponsor-mascot" initial={{ opacity: 0, scale: reduced ? 1 : 0.28 }} animate={{ opacity: visible ? 1 : 0, scale: visible || reduced ? 1 : 0.28 }} transition={{ duration: reduced ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}>
          <img src={art(`${tier.name}.png`)} alt="" width="2048" height="2048" draggable="false" />
          {nova && <span className="sponsor-nova-eyes" />}
        </motion.div>
      </motion.div>
    </div> : <>
    {nova && <motion.div className="sponsor-nova-impact" role="region" aria-label="Nova sponsorship impact" tabIndex={visible ? 0 : -1} animate={{ opacity: visible ? 1 : 0, y: visible || reduced ? 0 : 24 }} transition={{ duration: reduced ? 0 : 0.65, delay: reduced ? 0 : 0.18 }}>
      <h3>Help build Ignite’s foundation.</h3>
      <p>As a Founding Sponsor, you support our free learning mission from the beginning.</p>
      <ul>
        <li>Help fund practical lessons and hands-on learning resources.</li>
        <li>Discuss priorities with our team and identify where support is most useful.</li>
        <li>Explore ways to contribute expertise, resources, or community connections.</li>
      </ul>
    </motion.div>}
    <motion.div className="sponsor-tier-card" role="region" aria-labelledby={`tier-${tier.name.toLowerCase()}`} tabIndex={visible ? 0 : -1} animate={{ opacity: visible ? 1 : 0, y: visible || reduced ? 0 : 24 }} transition={{ duration: reduced ? 0 : 0.65, delay: reduced ? 0 : visible ? 0.4 : 0, ease: [0.16, 1, 0.3, 1] }}>
      <h2 id={`tier-${tier.name.toLowerCase()}`}>{tier.name} <span className="sponsor-tier-word">Tier</span></h2>
      <p className="sponsor-tier-range">{tier.range}</p>
      <p className={nova ? 'sponsor-founding' : 'sponsor-tier-description'}>{tier.description}</p>
    </motion.div></>}
  </section>;
}

export default function Sponsors() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const navigationTarget = useRef<number | null>(null);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [active, setActive] = useState(0);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ['start start', 'end end'] });
  const progress = scrollYProgress;
  const camera = useTransform(progress, (p) => cameraAt(p, size.width, size.height));
  const introOpacity = useTransform(progress, [0, 0.07, 0.15], [1, 1, 0]);
  const introVisibility = useTransform(progress, (p): 'visible' | 'hidden' => p < 0.15 ? 'visible' : 'hidden');
  const atmosphereOpacity = useTransform(progress, [0, 0.79, 0.94, 1], [0, 0, 1, 1]);
  const indicatorTop = useTransform(progress, [0, 0.06, 0.25, 0.44, 0.64, 0.92, 1], ['82%', '82%', '67%', '55%', '37%', '15%', '15%']);
  const indicatorLeft = useTransform(progress, [0, 0.06, 0.25, 0.44, 0.64, 0.92, 1], ['18%', '18%', '33%', '45%', '63%', '85%', '85%']);
  const { world, anchors, glassWidth } = geometry(size.width, size.height);
  const novaLayout = mascotLayout(size.width, size.height, 4);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setSize({ width: stage.clientWidth, height: stage.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(progress, 'change', (p) => {
    if (p > 0.001) setPromptDismissed(true);
    setActive(tierAt(p));
    if (navigationTarget.current !== null && Math.abs(p - stops[navigationTarget.current]) < 0.001) navigationTarget.current = null;
  });
  useEffect(() => {
    const p = progress.get();
    if (p > 0.001) setPromptDismissed(true);
    setActive(tierAt(p));
  }, [progress]);

  const goTo = useCallback((index: number, behavior: ScrollBehavior = 'instant') => {
    const journey = journeyRef.current;
    if (!journey) return;
    navigationTarget.current = index;
    window.scrollTo({ top: journey.offsetTop + stops[index] * (journey.offsetHeight - size.height), behavior });
  }, [size.height]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        if (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]')) return;
        const textBox = target.closest<HTMLElement>('.sponsor-tier-card, .sponsor-nova-impact');
        if (textBox && textBox.scrollHeight > textBox.clientHeight + 1) return;
      }
      event.preventDefault();
      if (event.repeat) return;
      const current = navigationTarget.current ?? tierAt(progress.get());
      const next = Math.max(0, Math.min(tiers.length - 1, current + (event.key === 'ArrowUp' ? 1 : -1)));
      if (next !== current) goTo(next, reduced ? 'instant' : 'smooth');
    };
    const cancelTarget = () => { navigationTarget.current = null; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', cancelTarget, { passive: true });
    window.addEventListener('touchstart', cancelTarget, { passive: true });
    window.addEventListener('pointerdown', cancelTarget, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', cancelTarget);
      window.removeEventListener('touchstart', cancelTarget);
      window.removeEventListener('pointerdown', cancelTarget);
    };
  }, [goTo, progress, reduced]);

  return <div className="sponsors-journey" ref={journeyRef}>
    <div className="sponsors-stage" ref={stageRef} data-tier={tiers[active].name} style={{ '--nova-scale': NOVA_SCALE, '--mascot-size': `${novaLayout.size}px`, '--glass-half': `${glassWidth / 2}px`, '--nova-anchor': `${anchors[4]}px` } as CSSProperties}>
      <motion.div className="sponsors-world" style={{ height: world, y: camera }} aria-hidden="true">
        <img className="sponsors-scenery" src={art('Thermo Background.jpg')} alt="" width="1536" height="2752" fetchPriority="high" draggable="false" />
      </motion.div>
      <motion.div className="sponsors-nova-atmosphere" style={{ opacity: atmosphereOpacity }} aria-hidden="true" />
      <motion.div className="sponsors-world sponsors-cast sponsors-mascot-layer" style={{ height: world, y: camera }}>
        {tiers.map((tier, index) => <Tier key={tier.name} index={index} active={active} layer="mascot" anchor={anchors[index]} width={size.width} height={size.height} progress={progress} reduced={reduced} />)}
        <div className="sponsors-glass-layer" aria-hidden="true"><Glass width={size.width} height={size.height} /></div>
      </motion.div>
      <motion.div className="sponsors-world sponsors-cast sponsors-copy-layer" style={{ height: world, y: camera }}>
        {tiers.map((tier, index) => <Tier key={tier.name} index={index} active={active} layer="copy" anchor={anchors[index]} width={size.width} height={size.height} progress={progress} reduced={reduced} />)}
      </motion.div>

      <header className="sponsors-header">
        <Link to="/" aria-label="Ignite home" className="sponsors-brand"><img src={`/mascots/Logo.png?v=${ART_REVISION}`} width="32" height="32" alt="" />Ignite</Link>
        <Link to="/partnerships" className="sponsors-back">Not interested in sponsoring? Check out our partnership options <RedirectArrow size={16} /></Link>
      </header>

      <motion.div className="sponsors-intro" style={{ opacity: introOpacity, visibility: introVisibility }}>
        <h1>Help us build<br />free courses.</h1>
        <p>We’re a student-led team creating lessons<br />in practical life skills. Your support helps us do it.</p>
        <a className="sponsors-meeting-button" href={PARTNERSHIP_MEETING_URL} target="_blank" rel="noopener noreferrer">
          Schedule a meeting <RedirectArrow size={18} />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </motion.div>

      <nav className="sponsors-tier-nav" aria-label="Sponsorship thermometer" aria-keyshortcuts="ArrowUp ArrowDown">
        <img className="sponsors-mini-thermometer" src={art('Thermometer.png')} width="1536" height="2995" alt="" draggable="false" />
        {tiers.map((tier, i) => <button key={tier.name} type="button" onClick={() => goTo(i)} aria-label={`${tier.name} Tier, ${tier.range}`} aria-current={active === i ? 'step' : undefined} style={{ '--stop': `${miniatureStops[i]}%`, '--horizontal-stop': `${100 - miniatureStops[i]}%` } as CSSProperties}><span className="sponsors-nav-label">{tier.name} Tier · {tier.temperature}</span></button>)}
        <motion.span className="sponsors-position-arrow sponsors-position-arrow--vertical" style={{ top: indicatorTop }} aria-hidden="true" />
        <motion.span className="sponsors-position-arrow sponsors-position-arrow--horizontal" style={{ left: indicatorLeft }} aria-hidden="true" />
        <span className="sponsors-current-temperature" aria-live="polite">{tiers[active].temperature}</span>
      </nav>

      <motion.div className="sponsors-scroll-overlay" initial={{ opacity: 1 }} animate={{ opacity: promptDismissed ? 0 : 1 }} transition={{ duration: reduced ? 0 : 0.5 }} aria-hidden={promptDismissed || undefined}>
        <button className="sponsors-scroll-dismiss" type="button" aria-label="Dismiss sponsorship navigation instructions" tabIndex={promptDismissed ? -1 : 0} style={{ pointerEvents: promptDismissed ? 'none' : 'auto' }} onClick={(event) => { event.currentTarget.blur(); setPromptDismissed(true); }}>
          <ArrowUp size={36} aria-hidden="true" /><span>Scroll or use ↑ / ↓<br />to explore sponsorship tiers.</span>
        </button>
      </motion.div>
      <div className="sponsors-progress" aria-hidden="true"><motion.div style={{ scaleX: progress }} /></div>
    </div>
  </div>;
}
