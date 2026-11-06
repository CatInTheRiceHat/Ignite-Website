import { Check } from 'lucide-react';

interface TimelineStep {
  id: string;
  title: string;
  kind: string;
  complete: boolean;
  onSelect: () => void;
}

export default function LearningTimeline({ weekNumber, steps, currentId }: { weekNumber: number; steps: readonly TimelineStep[]; currentId?: string }) {
  return <section className="demo-timeline" aria-labelledby="demo-timeline-title">
    <h2 id="demo-timeline-title">Week {weekNumber} timeline</h2>
    <p>Explore each part of the week and return whenever you need to.</p>
    <nav aria-label="Sample week timeline"><ol>
      {steps.map((step, index) => <li key={step.id}>
        <button type="button" onClick={step.onSelect} aria-current={currentId === step.id ? 'step' : undefined}>
          <span className={`demo-timeline-number${step.complete ? ' is-done' : ''}`} aria-hidden="true">{step.complete ? <Check size={16} /> : index + 1}</span>
          <span><strong>{step.title}</strong><span className="demo-timeline-kind">{step.complete ? 'Complete · ' : ''}{step.kind}</span></span>
        </button>
      </li>)}
    </ol></nav>
  </section>;
}
