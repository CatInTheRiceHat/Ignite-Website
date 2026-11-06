import { describe, expect, it } from 'vitest';
import { DEMO_STORAGE_KEY, emptyProgress, parseProgress, partComplete, buildWorkbook, lessonReady, updateNote } from '../src/lib/demoProgress';
import { lessonChecks } from '../src/data/demo/week';

describe('sample week browser progress', () => {
  it.each([null, 'broken json', 'null', '{}', '{"version":0}', '{"version":1,"done":42,"notes":null,"answers":[] }'])('recovers usable progress from invalid or old storage: %s', raw => {
    const state = parseProgress(raw);
    expect(state.version).toBe(1);
    expect(partComplete('finish', state)).toBe(false);
    expect(state.rubric).toHaveLength(3);
  });

  it('rejects out-of-range answers and ignores unrecognized notes and completion flags', () => {
    const state = parseProgress(JSON.stringify({ version: 1, done: ['unknown', 'finish'], notes: { evidence: 'A fictional example', privateInstructorNotes: 'must not restore' }, answers: { q505: { choice: 99, checked: true, attempts: -4 } }, rubric: [true] }));
    expect(state.answers).toEqual({});
    expect(state.notes).toEqual({ evidence: 'A fictional example' });
    expect(state.rubric).toEqual([true, false, false]);
    expect(partComplete('finish', state)).toBe(false);
  });

  it('does not turn a manual completion flag into evidence of completed applied work', () => {
    const state = { ...emptyProgress(), done: ['learn', 'case', 'finish'] as const };
    const restored = parseProgress(JSON.stringify(state));
    expect(partComplete('learn', restored)).toBe(false);
    expect(partComplete('case', restored)).toBe(false);
    expect(partComplete('finish', restored)).toBe(false);
  });

  it('exports actual learner writing without claiming a grade or a certificate', () => {
    const state = emptyProgress();
    state.notes.evidence = 'The hoodie belonged to Marcus’s brother.';
    state.notes['map-response'] = 'Please ask before borrowing my hoodie.';
    const workbook = buildWorkbook(state);
    expect(workbook).toContain(state.notes.evidence);
    expect(workbook).toContain(state.notes['map-response']);
    expect(workbook).toContain('not a course grade or certificate');
    expect(workbook).toContain('0 of 8');
    expect(DEMO_STORAGE_KEY).toBe('ignite:boundaries-week:v1');
  });

  it.each(['perspective', 'fiction', 'context', 'speaking'])('keeps completed work when optional writing %s is extended', id => {
    const state = { ...emptyProgress(), done: ['learn', 'friends', 'case', 'finish'] as ('learn' | 'friends' | 'case' | 'finish')[], rubric: [true, true, true] };
    const updated = updateNote(state, id, 'Another fictional observation about the friend group.');
    expect(updated.done).toEqual(state.done);
    expect(updated.rubric).toEqual([true, true, true]);
  });

  it('reopens only the matching self-review criterion after required case writing changes', () => {
    const state = { ...emptyProgress(), done: ['learn', 'friends', 'case', 'finish'] as ('learn' | 'friends' | 'case' | 'finish')[], rubric: [true, true, true] };
    const updated = updateNote(state, 'marcus', 'Marcus can name what matters without being responsible for Priya’s actions.');
    expect(updated.done).toEqual(['learn', 'friends']);
    expect(updated.rubric).toEqual([true, false, true]);
    expect(state.rubric).toEqual([true, true, true]);
  });

  it('requires an example of each boundary type to complete the lesson', () => {
    let state = emptyProgress();
    for (const q of lessonChecks) state.answers[q.id] = { choice: q.options.findIndex(o => o.correct), checked: true, attempts: 1 };
    expect(lessonReady(state)).toBe(false);
    for (const type of ['physical', 'emotional', 'time', 'belongings', 'digital']) state = updateNote(state, `example-${type}`, `A fictional ${type} boundary example.`);
    expect(lessonReady(parseProgress(JSON.stringify(state)))).toBe(true);
    state.done = ['learn', 'case', 'finish'];
    const revised = updateNote(state, 'example-time', 'Another fictional time boundary to review.');
    expect(revised.done).toEqual(['case']);
  });

  it('does not reuse an old final-check answer for the replacement belongings scenario', () => {
    const restored = parseProgress(JSON.stringify({ version: 1, answers: { q527: { choice: 1, checked: true, attempts: 1 } } }));
    expect(restored.answers).toEqual({});
    expect(partComplete('final', restored)).toBe(false);
  });
});
