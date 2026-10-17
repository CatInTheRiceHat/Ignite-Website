import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completionRequested = useRef(false);
  const [textVisible, setTextVisible] = useState(true);

  const completeIntro = useCallback(() => {
    if (completionRequested.current) return;
    completionRequested.current = true;
    // Keep the closing frame on the video surface throughout the exit fade.
    videoRef.current?.pause();
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    let active = true;
    let animationFrame = 0;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.dataset.introLoading = 'true';

    // A failed download or stalled player should never block the website.
    const timeout = window.setTimeout(completeIntro, 15000);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') completeIntro();
    };
    window.addEventListener('keydown', handleKeyDown);
    void videoRef.current?.play().catch(() => {
      if (active) completeIntro();
    });

    const checkClosingFrame = () => {
      const video = videoRef.current;
      // Pause just before the native ended state, which can repaint the video
      // surface while its parent is fading out on some browsers.
      if (video && !video.seeking && video.readyState >= 2 &&
          Number.isFinite(video.duration) && video.currentTime >= video.duration - 0.12) {
        completeIntro();
        return;
      }
      animationFrame = window.requestAnimationFrame(checkClosingFrame);
    };
    animationFrame = window.requestAnimationFrame(checkClosingFrame);

    return () => {
      active = false;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeout);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.introLoading;
    };
  }, [completeIntro]);

  return (
    <motion.div
      className="loading-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
    >
      <video
        ref={videoRef}
        className="loading-screen__video"
        src="/backgrounds/Loading%20Screen.mp4?v=2"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= 5) setTextVisible(false);
        }}
        onEnded={completeIntro}
        onError={completeIntro}
      />
      <button className="loading-screen__skip" type="button" onClick={completeIntro}>
        Skip intro <span aria-hidden="true">↗</span>
      </button>

      <div className="loading-screen__content">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: textVisible ? 1 : 0, y: 0 }}
          transition={{
            duration: textVisible ? 0.65 : 0.55,
            delay: textVisible ? 0.15 : 0,
            ease: 'easeOut',
          }}
        >
          <h1 id="loading-title" className="loading-screen__title">Ignite</h1>
          <p className="loading-screen__tagline">Find your fire.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
