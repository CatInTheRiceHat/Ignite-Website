import { casePrompts, caseRubric, caseStory, responseCheck } from '../../data/demo/week';
import { Question, type LearningProps } from './Question';
import { NoteField } from './Writing';

export function CaseStudy(props: LearningProps) {
  const { state, setState } = props;
  return <div className="demo-reader">
    <p className="demo-lead">Marcus tells Priya that borrowing his hoodie is fine, even though he feels differently when he talks with a friend afterward.</p>
    <p>Allow roughly 100 minutes to read the story and Friend Cards, write your responses and revise them against the criteria below. Several answers may be reasonable, so explain your thinking with details from the story rather than trying to guess a particular wording.</p>
    <article className="demo-story" aria-label="The Borrowed Hoodie story"><span className="demo-eyebrow">Cedar Creek · Monday to Thursday</span>{caseStory.map(p => <p key={p}>{p}</p>)}</article>
    <p className="demo-callout">Priya was responsible for asking before taking the hoodie, regardless of whether Marcus locked his locker or found it easy to speak up afterward. His later comment does not change how she took it.</p>
    <h3>Try supporting a friend</h3>
    <Question question={responseCheck} {...props} />
    <h3>Your responses to the case</h3>
    <p>Base your answers on the fictional story instead of personal experiences. Your writing stays in this browser and is not submitted to a mentor, so download anything you want to keep and reset the demo if you’re using a shared device.</p>
    {casePrompts.slice(0, 4).map(prompt => <div key={prompt.id}>
      <NoteField id={prompt.id} label={prompt.title} description={prompt.prompt} required={prompt.required} minimumLength={20} {...props} />
      <details className="demo-writing-support"><summary>Get a starting point for question {prompt.title[0]}</summary><p>{prompt.support}</p></details>
    </div>)}
    <details className="demo-challenge"><summary>Two optional questions to explore further</summary>{casePrompts.slice(4).map(prompt => <NoteField key={prompt.id} id={prompt.id} label={prompt.title} description={`${prompt.prompt} ${prompt.support}`} {...props} />)}</details>
    <details className="demo-model"><summary>See an example of feedback and revision</summary>
      <p><strong>Example first attempt:</strong> “Marcus should just say no. Priya didn’t know.”</p>
      <p><strong>Example feedback:</strong> You noticed that Marcus’s words and feelings differ. Add evidence about why the hoodie matters, keep responsibility for taking it with Priya, and suggest a specific repair.</p>
      <p><strong>Example revision:</strong> “The hoodie belonged to Marcus’s brother, so it has personal meaning. His ‘it’s fine’ does not match what he tells his friend later. Priya should have asked before taking it. She could apologize, return it, and ask Marcus how he wants the photo handled. A limit Marcus might choose is, ‘Please ask before borrowing my things.’”</p>
      <p>This example was written to show how a response might develop after feedback; it is not a student submission or feedback from a live mentor. Your answer can use different wording as long as you explain your reasoning with evidence.</p>
    </details>
    <h3>Review your work</h3>
    <p>Compare your responses with the criteria below and revise anything that is not yet covered before marking it as met. If you change a required response later, its matching criterion will need to be checked again. You are reviewing the quality of your own work here; meeting the minimum length does not mean an answer is correct.</p>
    <div className="demo-rubric">{caseRubric.map((criterion, i) => <label key={criterion}><input type="checkbox" checked={state.rubric[i]} onChange={e => {
      const checked = e.target.checked;
      setState(s => ({ ...s, rubric: s.rubric.map((v, n) => n === i ? checked : v), done: s.done.filter(p => p !== 'case' && p !== 'finish') }));
    }} /><span><strong>{state.rubric[i] ? 'Met' : 'Not yet'}</strong> · {criterion}</span></label>)}</div>
    <p className="demo-small">To save this activity as complete, answer questions 1 to 3 with at least 20 characters each, complete the scenario about supporting Marcus and check the three review criteria. You can also return to the optional questions later.</p>
  </div>;
}
