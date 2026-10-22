const params = new URLSearchParams(window.location.search);
export const introDebugEnabled = params.get('intro') === 'debug';
export const introBypassed = params.get('intro') === 'skip';

type DebugEvent = { atMs: number; event: string; details?: unknown };
const startedAt = performance.now();
const events: DebugEvent[] = [];

export function recordIntroEvent(event: string, details?: unknown) {
  if (!introDebugEnabled) return;
  events.push({ atMs: Math.round(performance.now() - startedAt), event, details });
  // Bound memory even if a broken player repeatedly emits the same event.
  if (events.length > 300) events.shift();
}

export function introDebugReport() {
  const video = document.querySelector<HTMLVideoElement>('.loading-screen__video');
  let playbackQuality;
  try {
    const quality = video?.getVideoPlaybackQuality?.();
    if (quality) playbackQuality = {
      totalFrames: quality.totalVideoFrames, droppedFrames: quality.droppedVideoFrames,
    };
  } catch { /* Some players do not expose frame counters. */ }
  return {
    userAgent: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight, pixelRatio: window.devicePixelRatio },
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    visibility: document.visibilityState,
    introMounted: Boolean(document.querySelector('.loading-screen')),
    scrollLocked: document.body.style.overflow === 'hidden',
    pageInert: Boolean(document.querySelector('#root [inert]')),
    video: video ? { ...videoState(video), playbackQuality } : null,
    events: [...events],
  };
}

function videoState(video: HTMLVideoElement) {
  return {
    src: video.currentSrc || video.src,
    currentTime: video.currentTime,
    duration: Number.isFinite(video.duration) ? video.duration : null,
    readyState: video.readyState,
    networkState: video.networkState,
    paused: video.paused,
    muted: video.muted,
    width: video.videoWidth,
    height: video.videoHeight,
    buffered: Array.from({ length: video.buffered.length }, (_, index) => [
      video.buffered.start(index), video.buffered.end(index),
    ]),
    error: video.error ? { code: video.error.code, message: video.error.message } : null,
  };
}

export function watchIntroVideo(video: HTMLVideoElement) {
  if (!introDebugEnabled) return () => {};
  const mediaEvents = [
    'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'playing',
    'waiting', 'stalled', 'suspend', 'pause', 'seeking', 'seeked', 'ended', 'error',
  ];
  const handleMediaEvent = (event: Event) => recordIntroEvent(`video:${event.type}`, videoState(video));
  mediaEvents.forEach(event => video.addEventListener(event, handleMediaEvent));
  recordIntroEvent('video:attached', videoState(video));
  let previous = performance.now();
  let frame = 0;
  const sample = (now: number) => {
    if (now - previous > 250 && !document.hidden) {
      recordIntroEvent('render:frame-gap', { gapMs: Math.round(now - previous), ...videoState(video) });
    }
    previous = now;
    frame = requestAnimationFrame(sample);
  };
  frame = requestAnimationFrame(sample);
  return () => {
    recordIntroEvent('video:detached', videoState(video));
    mediaEvents.forEach(event => video.removeEventListener(event, handleMediaEvent));
    cancelAnimationFrame(frame);
  };
}

export function watchIntroPageErrors() {
  if (!introDebugEnabled) return () => {};
  const handleError = (event: ErrorEvent | Event) => {
    if (event instanceof ErrorEvent) {
      recordIntroEvent('page:error', { message: event.message, stack: event.error?.stack });
    } else if (event.target instanceof HTMLImageElement || event.target instanceof HTMLVideoElement) {
      recordIntroEvent('resource:error', { src: event.target.currentSrc || event.target.src });
    }
  };
  const handleRejection = (event: PromiseRejectionEvent) => recordIntroEvent('page:unhandled-rejection', {
    message: String(event.reason), stack: event.reason instanceof Error ? event.reason.stack : undefined,
  });
  window.addEventListener('error', handleError, true);
  window.addEventListener('unhandledrejection', handleRejection);
  return () => {
    window.removeEventListener('error', handleError, true);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
}
