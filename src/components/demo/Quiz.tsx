import { useEffect, useRef, useState } from 'react';
import type { DemoQuestion } from '../../data/demo/questions';
import { answeredCorrectly } from '../../lib/demoProgress';
import { Question, type LearningProps } from './Question';

export function Quiz({ questions, state, setState }: LearningProps & { questions: DemoQuestion[] }) {
  const [index, setIndex] = useState(() => Math.max(0, questions.findIndex(q => !answeredCorrectly(q, state))));
  const title = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const correct = questions.filter(q => answeredCorrectly(q, state)).length;
  const first = questions.filter(q => state.answers[q.id]?.firstCorrect === true).length;
  useEffect(() => { if (moved.current) title.current?.focus(); }, [index]);
  const go = (i: number) => { moved.current = true; setIndex(i); };
  return <div className="demo-quiz">
    <div className="demo-quiz-summary"><strong>{correct} of {questions.length} correct after review</strong><span>Untimed · hints · unlimited retries</span></div>
    <p>You can move between questions. Check each answer and use its feedback before trying again.</p>
    <nav className="demo-question-nav" aria-label="Questions">
      {questions.map((q, i) => <button type="button" key={q.id} onClick={() => go(i)} aria-current={index === i ? 'step' : undefined} aria-label={`Question ${i + 1}${answeredCorrectly(q, state) ? ', correct' : ', not yet complete'}`} className={answeredCorrectly(q, state) ? 'is-complete' : ''}>{i + 1}{answeredCorrectly(q, state) && <span aria-hidden="true"> ✓</span>}</button>)}
    </nav>
    <h3 ref={title} tabIndex={-1} className="demo-question-heading">Question {index + 1} of {questions.length}</h3>
    <Question key={questions[index].id} question={questions[index]} state={state} setState={setState} />
    <div className="demo-pagination">
      <button type="button" className="demo-button demo-button-secondary" disabled={index === 0} onClick={() => go(index - 1)}>Previous question</button>
      <button type="button" className="demo-button demo-button-secondary" disabled={index === questions.length - 1} onClick={() => go(index + 1)}>Next question</button>
    </div>
    {correct === questions.length && <div role="status" className="demo-callout">You have answered all {questions.length} questions correctly after reviewing the feedback, with {first} correct on your first attempt. These results record your practice in this sample week and do not count toward an official course grade.</div>}
  </div>;
}
