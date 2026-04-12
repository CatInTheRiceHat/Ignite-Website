import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface MarqueeProps {
  children: ReactNode;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

const Marquee = ({ children, reverse = false, pauseOnHover = true, className }: MarqueeProps) => {
  return (
    <div
      className={cn(
        'flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_8%,white_92%,transparent)]',
        className
      )}
    >
      <div
        className={cn(
          'flex min-w-full shrink-0 gap-5 py-3',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          'flex min-w-full shrink-0 gap-5 py-3',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Marquee;
