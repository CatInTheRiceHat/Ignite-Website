import { useEffect, useState } from 'react';
import { introDebugReport, recordIntroEvent, watchIntroPageErrors } from '../lib/introDebug';

export default function IntroDebug() {
  const [report, setReport] = useState(introDebugReport);
  useEffect(() => {
    const stop = watchIntroPageErrors();
    recordIntroEvent('debug:ready');
    const interval = window.setInterval(() => setReport(introDebugReport()), 500);
    return () => { stop(); window.clearInterval(interval); };
  }, []);

  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(introDebugReport(), null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ignite-intro-debug.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const bypass = new URL(window.location.href);
  bypass.searchParams.set('intro', 'skip');
  const latest = report.events.at(-1);
  return (
    <aside className="intro-debug" aria-label="Intro diagnostics">
      <strong>Intro diagnostics</strong>
      <p>{report.introMounted ? 'Intro active' : 'Website revealed'} · Scroll {report.scrollLocked ? 'locked' : 'unlocked'}</p>
      <p>{report.video ? `Video ${report.video.currentTime.toFixed(1)}s / ${report.video.duration?.toFixed(1) ?? '?'}s · Ready ${report.video.readyState}` : 'Video unmounted'}</p>
      <p>{latest ? `${latest.atMs}ms: ${latest.event}` : 'Waiting for events'}</p>
      <div>
        <button type="button" onClick={download}>Download report</button>
        <button type="button" onClick={() => window.location.reload()}>Replay</button>
        <a href={bypass.href}>Test without intro</a>
      </div>
    </aside>
  );
}
