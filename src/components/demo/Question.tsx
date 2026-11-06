import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react';
import type { DemoQuestion } from '../../data/demo/questions';
import type { DemoProgress } from '../../lib/demoProgress';

export interface LearningProps { state: DemoProgress; setState: Dispatch<SetStateAction<DemoProgress>> }
export function Question({ question: q, state, setState }: LearningProps & { question: DemoQuestion }) {
  const [hint, setHint] = useState(false);
  const feedback = useRef<HTMLDivElement>(null);
  const radios = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocus = useRef<'feedback' | 'retry' | null>(null);
  const answer = state.answers[q.id];
  const checked = answer?.checked ?? false;
  const correct = checked && q.options[answer.choice]?.correct;
  const choose = (choice: number) => setState(s => ({ ...s, answers: { ...s.answers, [q.id]: { ...s.answers[q.id], choice, checked: false, attempts: s.answers[q.id]?.attempts ?? 0 } } }));
  useEffect(() => {
    if (pendingFocus.current === 'feedback' && checked) feedback.current?.focus();
    if (pendingFocus.current === 'retry' && !checked) radios.current[answer?.choice ?? 0]?.focus();
    pendingFocus.current = null;
  }, [checked, answer?.choice]);
  const check = () => {
    pendingFocus.current = 'feedback';
    setState(s => {
    const a = s.answers[q.id];
    if (!a || a.checked) return s;
    return { ...s, answers: { ...s.answers, [q.id]: { ...a, checked: true, attempts: a.attempts + 1, firstCorrect: a.firstCorrect ?? q.options[a.choice].correct } } };
    });
  };
  return <div className="demo-question">
    <fieldset disabled={checked} aria-describedby={hint && !checked ? `${q.id}-hint` : undefined}>
      <legend>{q.prompt}</legend>
      <div className="demo-options">
        {q.options.map((option, i) => <label key={i} className={`demo-option ${answer?.choice === i ? 'is-selected' : ''}`}>
          <input ref={element => { radios.current[i] = element; }} type="radio" name={q.id} value={i} checked={answer?.choice === i} onChange={() => choose(i)} />
          <span>{option.text}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="demo-actions">
      {!checked && <button type="button" className="demo-button" disabled={!answer} onClick={check}>Check answer</button>}
      {!checked && <button type="button" className="demo-text-button" aria-expanded={hint} aria-controls={`${q.id}-hint`} onClick={() => setHint(v => !v)}><Lightbulb size={17} aria-hidden="true" />{hint ? 'Hide hint' : 'Get a hint'}</button>}
    </div>
    <p id={`${q.id}-hint`} className="demo-hint" hidden={!hint || checked}>{q.hint}</p>
    <div ref={feedback} role="status" aria-live="polite" aria-atomic="true" tabIndex={-1} className={checked ? `demo-feedback ${correct ? 'is-correct' : ''}` : undefined}>
      {checked && <>
      <p className="demo-feedback-title">{correct ? <CheckCircle2 size={20} aria-hidden="true" /> : <Lightbulb size={20} aria-hidden="true" />}{correct ? 'Correct' : 'Review this answer'}</p>
      <p>{q.options[answer.choice].feedback}</p>
      {correct && q.explanation !== q.options[answer.choice].feedback && <p>{q.explanation}</p>}
      {!correct && <button type="button" className="demo-text-button" onClick={() => { pendingFocus.current = 'retry'; choose(answer.choice); setHint(true); }}><RotateCcw size={16} aria-hidden="true" />Try again</button>}
      </>}
    </div>
  </div>;
}
