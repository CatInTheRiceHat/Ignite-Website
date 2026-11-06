import { questionSets, type DemoQuestion } from '../data/demo/questions';
import { boundaryTypes, casePrompts, caseRubric, lessonChecks, parts, responseCheck, type PartId } from '../data/demo/week';

export const DEMO_STORAGE_KEY = 'ignite:boundaries-week:v1';
export interface Answer { choice: number; checked: boolean; attempts: number; firstCorrect?: boolean }
export interface DemoProgress {
  version: 1;
  done: PartId[];
  answers: Record<string, Answer>;
  notes: Record<string, string>;
  rubric: boolean[];
}
export const allQuestions = [...Object.values(questionSets).flat(), ...lessonChecks, responseCheck];
export const exampleKeys = boundaryTypes.map(type => `example-${type.name.toLowerCase()}`);
const noteKeys = [...casePrompts.map(p => p.id), ...exampleKeys, 'perspective', 'map-boundary', 'map-evidence', 'map-response', 'map-next'];
export const emptyProgress = (): DemoProgress => ({ version: 1, done: [], answers: {}, notes: {}, rubric: caseRubric.map(() => false) });

// Browser storage is optional and untrusted. Discard malformed/older data, not the page.
export function parseProgress(raw: string | null): DemoProgress {
  const fresh = emptyProgress();
  try {
    const value = JSON.parse(raw ?? 'null');
    if (!value || value.version !== 1) return fresh;
    fresh.done = Array.isArray(value.done) ? parts.filter(p => value.done.includes(p.id)).map(p => p.id) : [];
    for (const q of allQuestions) {
      const a = value.answers?.[q.id];
      if (a && Number.isInteger(a.choice) && a.choice >= 0 && a.choice < q.options.length && typeof a.checked === 'boolean') {
        fresh.answers[q.id] = {
          choice: a.choice, checked: a.checked,
          attempts: Number.isSafeInteger(a.attempts) ? Math.max(0, Math.min(a.attempts, 10000)) : 0,
          ...(typeof a.firstCorrect === 'boolean' ? { firstCorrect: a.firstCorrect } : {}),
        };
      }
    }
    for (const key of noteKeys) if (typeof value.notes?.[key] === 'string') fresh.notes[key] = value.notes[key].slice(0, 4000);
    fresh.rubric = caseRubric.map((_, i) => value.rubric?.[i] === true);
  } catch { /* Start clean when storage is corrupted or unavailable. */ }
  return fresh;
}
export function answeredCorrectly(question: DemoQuestion, state: DemoProgress): boolean {
  const a = state.answers[question.id];
  return !!(a?.checked && question.options[a.choice]?.correct);
}
export function caseReady(state: DemoProgress): boolean {
  return casePrompts.filter(p => p.required).every(p => (state.notes[p.id] ?? '').trim().length >= 20)
    && state.rubric.every(Boolean) && answeredCorrectly(responseCheck, state);
}
export function mapReady(state: DemoProgress): boolean {
  return ['map-boundary', 'map-evidence', 'map-response', 'map-next'].every(k => (state.notes[k] ?? '').trim().length >= 10);
}
export function lessonReady(state: DemoProgress): boolean {
  return lessonChecks.every(q => answeredCorrectly(q, state))
    && exampleKeys.every(key => (state.notes[key] ?? '').trim().length >= 10);
}
export function updateNote(state: DemoProgress, id: string, value: string): DemoProgress {
  if (state.notes[id] === value) return state;
  const criterion = casePrompts.filter(p => p.required).findIndex(p => p.id === id);
  const invalidated: PartId[] = criterion >= 0 ? ['case', 'finish']
    : exampleKeys.includes(id) ? ['learn', 'finish'] : id.startsWith('map-') ? ['finish'] : [];
  return {
    ...state,
    notes: { ...state.notes, [id]: value },
    done: state.done.filter(part => !invalidated.includes(part)),
    rubric: criterion >= 0 ? state.rubric.map((met, i) => i === criterion ? false : met) : state.rubric,
  };
}
export function partComplete(id: PartId, state: DemoProgress): boolean {
  if (id === 'warmup' || id === 'types' || id === 'choices' || id === 'final') return questionSets[id].every(q => answeredCorrectly(q, state));
  if (id === 'learn') return state.done.includes(id) && lessonReady(state);
  if (id === 'case') return state.done.includes(id) && caseReady(state);
  if (id === 'finish') return state.done.includes(id) && mapReady(state) && parts.filter(p => p.id !== 'finish').every(p => partComplete(p.id, state));
  return state.done.includes(id);
}
export function buildWorkbook(state: DemoProgress): string {
  return [
    'IGNITE · SAMPLE WEEK WORKBOOK', 'Relationships, Boundaries & Social Skills', 'Week 1: What Are Boundaries?',
    'This is practice from a sample week, not a course grade or certificate.',
    `Completed parts: ${parts.filter(p => partComplete(p.id, state)).length} of ${parts.length}`,
    '', 'MY EXAMPLES OF THE FIVE BOUNDARY TYPES',
    ...boundaryTypes.map(type => `${type.name}: ${state.notes[`example-${type.name.toLowerCase()}`] || '(not written yet)'}`),
    '', 'MY BOUNDARIES MAP',
    ...['boundary', 'evidence', 'response', 'next'].map(k => `${k.toUpperCase()}: ${state.notes['map-' + k] || '(not written yet)'}`),
    '', 'THE BORROWED HOODIE · MY RESPONSES',
    ...casePrompts.map(p => `${p.title}\n${state.notes[p.id] || '(not written yet)'}`),
    '', 'MY REVIEW OF THE CASE (reviewed by me, not graded by a mentor)',
    ...caseRubric.map((text, i) => `${state.rubric[i] ? 'Met' : 'Not yet'}: ${text}`),
    '', 'PERSPECTIVE REFLECTION', state.notes.perspective || '(not written yet)',
    '', 'PRACTICE AND FINAL CHECK',
    ...Object.entries(questionSets).map(([id, questions]) => `${{ warmup: 'Opening practice', types: 'Boundary types', choices: 'Choosing limits', final: 'Week 1 assessment' }[id]}: ${questions.filter(q => answeredCorrectly(q, state)).length}/${questions.length} correct after review; ${questions.filter(q => state.answers[q.id]?.firstCorrect === true).length}/${questions.length} correct on the first attempt.`),
    '', 'Keep this file somewhere private. You can reset the browser demo to remove this work from the device.',
  ].join('\n\n');
}
