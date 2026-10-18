import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const snapshotRef = useRef<HTMLCanvasElement>(null);
  const exitFrameRef = useRef(0);
  const completionRequested = useRef(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [snapshotVisible, setSnapshotVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  // Keep the selected clip stable if the phone rotates during the intro.
  const [isMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  const completeIntro = useCallback(() => {
    if (completionRequested.current) return;
    completionRequested.current = true;
    const video = videoRef.current;
    const snapshot = snapshotRef.current;
    const context = snapshot?.getContext('2d');
    if (!video || video.readyState < 2 || !snapshot || !context) {
      video?.pause();
      onComplete();
      return;
    }

    // Fade a still image, so the video compositor cannot clear or repaint the
    // closing frame during the transition. Keep the same aspect ratio and crop.
    snapshot.width = video.videoWidth;
    snapshot.height = video.videoHeight;
    try {
      context.drawImage(video, 0, 0);
    } catch {
      // A player error must still allow the visitor to reach the website.
      video.pause();
      onComplete();
      return;
    }
    video.pause();
    setSnapshotVisible(true);

    // Let the still image paint before starting the fade.
    exitFrameRef.current = window.requestAnimationFrame(() => {
      exitFrameRef.current = window.requestAnimationFrame(() => {
        onComplete();
      });
    });
  }, [onComplete]);

  useEffect(() => {
    let active = true;
    let playbackFrame = 0;
    const video = videoRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.dataset.introLoading = 'true';

    // A failed download or stalled player should never block the website.
    let timeout = window.setTimeout(completeIntro, 15000);
    const playbackPrompt = window.setTimeout(() => {
      if (active && !completionRequested.current && video && (video.paused || video.currentTime === 0)) {
        setPlaybackBlocked(true);
      }
    }, 2000);
    const handlePlaying = () => {
      window.clearTimeout(playbackPrompt);
      setPlaybackBlocked(false);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(completeIntro, 15000);
    };
    video?.addEventListener('playing', handlePlaying);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') completeIntro();
    };
    window.addEventListener('keydown', handleKeyDown);
    const startPlayback = () => {
      if (!active || completionRequested.current || !video) return;
      // play() can wait for data itself. Mobile browsers may never emit
      // canplaythrough, so waiting for that event can leave the poster frozen.
      video.defaultMuted = true;
      video.muted = true;
      void video.play().catch((error: unknown) => {
        if (!active || completionRequested.current) return;
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          setPlaybackBlocked(true);
        } else {
          completeIntro();
        }
      });
    };
    startPlayback();

    const checkClosingFrame = () => {
      if (!video || completionRequested.current) return;
      if (!video.seeking && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          Number.isFinite(video.duration) && video.currentTime >= video.duration - 0.1) {
        // Capture before the native ended state can clear the video surface.
        completeIntro();
        return;
      }
      playbackFrame = window.requestAnimationFrame(checkClosingFrame);
    };
    playbackFrame = window.requestAnimationFrame(checkClosingFrame);

    return () => {
      active = false;
      video?.removeEventListener('playing', handlePlaying);
      window.cancelAnimationFrame(playbackFrame);
      window.cancelAnimationFrame(exitFrameRef.current);
      window.clearTimeout(timeout);
      window.clearTimeout(playbackPrompt);
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
        style={{ visibility: snapshotVisible ? 'hidden' : 'visible' }}
        src={isMobile ? '/backgrounds/Loading%20Screen%20Mobile.mp4?v=1' : '/backgrounds/Loading%20Screen.mp4?v=4'}
        poster={isMobile ? '/backgrounds/Loading%20Screen%20Mobile.webp' : '/backgrounds/Loading%20Screen.webp'}
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
      <canvas
        ref={snapshotRef}
        className="loading-screen__snapshot"
        style={{ visibility: snapshotVisible ? 'visible' : 'hidden' }}
        aria-hidden="true"
      />
      <button className="loading-screen__skip" type="button" onClick={completeIntro}>
        Skip intro <span aria-hidden="true">↗</span>
      </button>
      {playbackBlocked && (
        <button
          className="loading-screen__play"
          type="button"
          onClick={() => {
            void videoRef.current?.play().then(() => setPlaybackBlocked(false)).catch(completeIntro);
          }}
        >
          Play intro <span aria-hidden="true">▶</span>
        </button>
      )}

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
