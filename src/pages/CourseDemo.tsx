import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, CheckCircle2, Download, RotateCcw, ShieldCheck } from 'lucide-react';
import { RedirectArrow } from '../components/ui/redirect-arrow';
import CourseCreators from '../components/program/CourseCreators';
import LearningTimeline from '../components/demo/LearningTimeline';
import { courseSamples } from '../config/courseDemo';
import { parts, type PartId } from '../data/demo/week';
import { questionSets } from '../data/demo/questions';
import { buildWorkbook, caseReady, lessonReady, mapReady, partComplete } from '../lib/demoProgress';
import { useDemoProgress } from '../components/demo/useDemoProgress';
import { Lesson } from '../components/demo/Lesson';
import { Friends } from '../components/demo/Friends';
import { CaseStudy } from '../components/demo/CaseStudy';
import { Quiz } from '../components/demo/Quiz';
import { NoteField } from '../components/demo/Writing';
import '../components/demo/demo.css';

const sample = courseSamples.boundaries;

const CourseDemo = () => {
  const [params, setParams] = useSearchParams();
  const selectedPart = parts.find(p => p.id === params.get('part'));
  const current = selectedPart ?? parts[0];
  const { state, setState, saved, reset } = useDemoProgress();
  const [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const previousPart = useRef(selectedPart?.id);
  const count = parts.filter(p => partComplete(p.id, state)).length;
  const props = { state, setState };
  const go = (id?: PartId) => {
    const next = new URLSearchParams(params);
    if (id) next.set('part', id); else next.delete('part');
    setParams(next);
    setNotice('');
  };
  useEffect(() => {
    const shouldFocus = !!(selectedPart || previousPart.current);
    previousPart.current = selectedPart?.id;
    const frame = requestAnimationFrame(() => {
      if (!shouldFocus) return;
      heading.current?.focus({ preventScroll: true });
      heading.current?.parentElement?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedPart]);
  useEffect(() => {
    document.body.setAttribute('data-course-demo', '');
    return () => document.body.removeAttribute('data-course-demo');
  }, []);
  const download = () => {
    const url = URL.createObjectURL(new Blob([buildWorkbook(state)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'ignite-boundaries-week-1.txt'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Your workbook download is ready. Keep it somewhere private.');
  };
  const mark = (id: PartId) => {
    setState(s => ({ ...s, done: [...new Set([...s.done, id])] }));
    setNotice(id === 'finish' ? 'Sample week complete. Your work is ready to download.' : 'Part complete. You can revisit it at any time.');
  };
  const canMark = current.id === 'learn' ? lessonReady(state)
    : current.id === 'case' ? caseReady(state)
      : current.id === 'finish' ? mapReady(state) && parts.slice(0, -1).every(p => partComplete(p.id, state)) : true;
  const quizPart = ['warmup', 'types', 'choices', 'final'].includes(current.id);
  const currentIndex = parts.findIndex(p => p.id === current.id);

  return <div className="course-demo">
    <section className="demo-hero" aria-label="Sample week introduction">
      <img className="demo-hero-background" src={sample.course.headerImage} alt="" width={2752} height={1536} />
      <div className="demo-hero-overlay" aria-hidden="true" />
      <div className="demo-hero-inner">
        <div>
          <h1 id="demo-title">{sample.course.title}</h1>
          <CourseCreators course={sample.course} className="mt-5" />
          <p className="demo-hero-description">{sample.summary}</p>
          <p className="demo-hero-small">The sample week takes {sample.workload.toLowerCase()}, and your progress is saved in this browser.</p>
        </div>
        <LearningTimeline weekNumber={sample.weekNumber} currentId={current.id} steps={parts.map(part => ({ ...part, complete: partComplete(part.id, state), onSelect: () => go(part.id) }))} />
      </div>
    </section>

    <div className="demo-mobile-jump"><label htmlFor="demo-jump">Jump to a part · {count} of {parts.length} complete</label><select id="demo-jump" value={current.id} onChange={event => go(event.target.value as PartId)}>{parts.map((part, i) => <option key={part.id} value={part.id}>{i + 1}. {part.title}{partComplete(part.id, state) ? ' · complete' : ''}</option>)}</select></div>
    <div className="demo-workspace" id="week-workspace">
      <aside className="demo-sidebar" aria-label="Week navigation and progress">
        <div className="demo-progress-heading"><strong>Your week</strong><span>{count} / {parts.length} complete</span></div>
        <progress max={parts.length} value={count} aria-label="Sample week completion" />
        <nav aria-label="Sample week parts"><ol>{parts.map((part, i) => <li key={part.id}>
          <button type="button" aria-current={current.id === part.id ? 'step' : undefined} onClick={() => go(part.id)}>
            <span className={`demo-step-number ${partComplete(part.id, state) ? 'is-done' : ''}`} aria-hidden="true">{partComplete(part.id, state) ? <Check size={16} /> : i + 1}</span>
            <span><span className="demo-step-title">{part.title}</span><span className="demo-step-kind">{partComplete(part.id, state) ? 'Complete · ' : ''}{part.kind}</span></span>
          </button>
        </li>)}</ol></nav>
        <div className="demo-save-note"><ShieldCheck size={18} aria-hidden="true" /><p>{saved ? 'Your work is saved in this browser so you can return on this device; it is not submitted to anyone.' : 'Browser saving is unavailable, so download your work before closing this tab.'}</p></div>
        <div className="demo-utility-actions"><button type="button" onClick={download}><Download size={16} aria-hidden="true" />Download work</button><button type="button" onClick={() => resetDialog.current?.showModal()}><RotateCcw size={16} aria-hidden="true" />Reset progress</button></div>
      </aside>

      <section className="demo-content" aria-labelledby="part-title">
        <header className="demo-part-header">
          <p className="demo-eyebrow">Part {currentIndex + 1} of {parts.length} · {current.kind}</p>
          <h2 id="part-title" ref={heading} tabIndex={-1}>{current.title}</h2>
          <p>{current.detail}</p>
        </header>
        {current.id === 'learn' && <Lesson {...props} />}
        {quizPart && <Quiz key={current.id} questions={questionSets[current.id as keyof typeof questionSets]} {...props} />}
        {current.id === 'friends' && <Friends {...props} />}
        {current.id === 'case' && <CaseStudy {...props} />}
        {current.id === 'finish' && <div className="demo-reader">
          <p className="demo-lead">Create a response card that shows how Marcus or another fictional character could handle a boundary being crossed.</p>
          <p>Choose a specific situation and explain what matters to the character, what they could say or do, and how they could get support if the problem continues. These answers will form your Boundaries Map in the workbook.</p>
          <NoteField id="map-boundary" label="The boundary" description="Which boundary is involved, and what need does it protect?" required {...props} />
          <NoteField id="map-evidence" label="The evidence" description="Which details show what happened and what matters to the character?" required {...props} />
          <NoteField id="map-response" label="A clear response" description="Write what the character could say or do. A firm no is allowed. An explanation or alternative offer is optional." required {...props} />
          <NoteField id="map-next" label="If the boundary is ignored" description="Choose a practical next step: step away where possible, ask for support, or speak with a trusted adult. Keep the character’s choices central." required {...props} />
          <div className="demo-callout">Review whether your map explains the character’s needs, uses details from the story, respects consent and includes a next step they could actually take. Revise any answer that needs more explanation before finishing the week.</div>
          {partComplete('finish', state) && <div className="demo-completion" role="status"><CheckCircle2 size={32} aria-hidden="true" /><h3>You finished the sample week.</h3><p>Your workbook now contains the examples, case responses and Boundaries Map you completed, along with your practice results. Download a copy if you want to keep it outside this browser.</p></div>}
          <button type="button" className="demo-button demo-button-secondary" onClick={download}><Download size={18} aria-hidden="true" />Download my workbook</button>
          <div className="demo-next-course"><h3>Explore more Ignite courses</h3><p>Visit the course catalog to see what else is being developed and find a subject you’d like to explore.</p><Link to="/program#course-catalog" className="demo-button">Explore Ignite courses<RedirectArrow /></Link></div>
        </div>}

        <footer className="demo-part-footer">
          {!quizPart && !partComplete(current.id, state) && <><button type="button" className="demo-button" disabled={!canMark} onClick={() => mark(current.id)}><Check size={18} aria-hidden="true" />{current.id === 'finish' ? 'Complete the sample week' : current.id === 'case' ? 'Save my case study' : 'Mark this part complete'}</button>
            {!canMark && <p className="demo-small">{current.id === 'learn' ? 'Before marking this lesson complete, answer the four guided questions and write and review an example of each boundary type. Each written example needs at least 10 characters.' : current.id === 'case' ? 'Complete the scenario, questions 1 to 3 and the three review criteria before recording your work.' : 'Finish the other seven parts and write each response on your card, using at least 10 characters per response.'}</p>}</>}
          {partComplete(current.id, state) && <p className="demo-complete-label"><CheckCircle2 size={20} aria-hidden="true" />Completed. You can return to this section whenever you need it.</p>}
          <div className="demo-pagination">{currentIndex > 0 && <button type="button" className="demo-text-button" onClick={() => go(parts[currentIndex - 1].id)}>Previous part</button>}{currentIndex < parts.length - 1 && <button type="button" className="demo-button demo-button-secondary" onClick={() => go(parts[currentIndex + 1].id)}>Next: {parts[currentIndex + 1].title}<RedirectArrow size={16} /></button>}</div>
        </footer>
        <p className="demo-announcement" role="status">{notice || (!saved ? 'Progress cannot be saved in this browser. Download your work before closing this tab.' : '')}</p>
      </section>
    </div>
    <dialog ref={resetDialog} className="demo-reset-dialog" aria-labelledby="reset-title" aria-describedby="reset-description">
      <h2 id="reset-title">Start fresh?</h2><p id="reset-description">This clears all answers, writing and completion for this sample week in this browser. Download any work you want to keep first.</p>
      <div className="demo-actions"><button type="button" className="demo-button demo-button-secondary" onClick={() => resetDialog.current?.close()}>Keep my progress</button><button type="button" className="demo-button" onClick={() => { const cleared = reset(); resetDialog.current?.close(); go(); setNotice(cleared ? 'Demo progress reset. You can start again.' : 'This tab was reset, but saved work could not be cleared. Clear this site’s browser data before leaving a shared device.'); }}>Reset everything</button></div>
    </dialog>
  </div>;
};

export default CourseDemo;
