import { useMemo, type ReactNode } from 'react';
import { useBriefAnimation } from '../../lib/use-brief-animation';

interface BlurFadeProps {
  children: ReactNode;
  delay?: number;
  yOffset?: number;
  className?: string;
}

const BlurFade = ({ children, delay = 0, yOffset = 16, className }: BlurFadeProps) => {
  const frames = useMemo(() => [
    { opacity: 0.8, transform: `translateY(${Math.min(Math.max(yOffset, 0), 8)}px)` },
    { opacity: 1, transform: 'translateY(0)' },
  ], [yOffset]);
  const ref = useBriefAnimation(frames, 420, delay * 1000);
  return (
    <div ref={ref} className={className} data-brief-reveal>
      {children}
    </div>
  );
};

export default BlurFade;
