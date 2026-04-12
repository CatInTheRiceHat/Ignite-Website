import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface BlurFadeProps {
  children: ReactNode;
  delay?: number;
  yOffset?: number;
  className?: string;
}

const BlurFade = ({ children, delay = 0, yOffset = 16, className }: BlurFadeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default BlurFade;
