import type { LearningProps } from './Question';
import { updateNote } from '../../lib/demoProgress';

export function NoteField({ id, label, description, state, setState, required = false, minimumLength = 10, rows = 4 }: LearningProps & { id: string; label: string; description: string; required?: boolean; minimumLength?: number; rows?: number }) {
  const count = (state.notes[id] ?? '').trim().length;
  return <div className="demo-note-field">
    <label htmlFor={`note-${id}`}>{label}{required && <span className="demo-required"> · required</span>}</label>
    <p id={`note-${id}-help`}>{description}</p>
    <textarea id={`note-${id}`} aria-describedby={`note-${id}-help${required ? ` note-${id}-length` : ''}`} rows={rows} minLength={required ? minimumLength : undefined} maxLength={4000} required={required} value={state.notes[id] ?? ''} onChange={e => {
      const value = e.target.value;
      setState(s => updateNote(s, id, value));
    }} />
    {required && <p id={`note-${id}-length`} className="demo-small">{count < minimumLength ? `Write at least ${minimumLength - count} more characters to save this response as complete.` : `Minimum length of ${minimumLength} characters reached.`}</p>}
  </div>;
}
