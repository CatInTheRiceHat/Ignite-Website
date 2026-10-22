import { ArrowRight, type LucideProps } from 'lucide-react';

/** Shared link arrow for the website and the embeddable Sol widget. */
export function RedirectArrow({ size = 20, className = '', ...props }: LucideProps) {
  return (
    <ArrowRight
      {...props}
      size={size}
      strokeWidth={2}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    />
  );
}
