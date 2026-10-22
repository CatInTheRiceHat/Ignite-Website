import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const backgrounds = Object.fromEntries(['spring', 'summer', 'fall', 'winter']
  .map(season => [season, `https://example.test/${season}.jpg`]));
const source = readFileSync(new URL('../../moodle/authentication.html', import.meta.url), 'utf8')
  .match(/<script>([\s\S]*?)<\/script>/)![1]
  .replace('__IGNITE_SEASONAL_BACKGROUNDS__', JSON.stringify(backgrounds));

function mount(bodyId = 'page-login-index') {
  const page = { dataset: {} as Record<string, string>, style: { backgroundImage: '' } };
  const events = new Map<string, () => void>();
  const context = {
    Date, Intl, setTimeout, clearTimeout,
    document: {
      body: { id: bodyId }, hidden: false,
      querySelector: () => null,
      getElementById: (id: string) => id === 'page' ? page : null,
      addEventListener: (name: string, callback: () => void) => events.set(name, callback),
    },
    window: { addEventListener: (name: string, callback: () => void) => events.set(name, callback) },
  };
  runInNewContext(source, context);
  return { page, context, events };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe.each(['page-login-index', 'page-login-signup'])('%s seasonal artwork', (bodyId) => {
  it.each([
    [1, 'winter'], [2, 'winter'], [3, 'spring'], [4, 'spring'], [5, 'spring'],
    [6, 'summer'], [7, 'summer'], [8, 'summer'], [9, 'fall'], [10, 'fall'],
    [11, 'fall'], [12, 'winter'],
  ])('maps month %s to %s', (month, season) => {
    vi.setSystemTime(new Date(`2027-${String(month).padStart(2, '0')}-15T12:00:00Z`));
    const { page } = mount(bodyId);
    expect(page.dataset.igniteSeason).toBe(season);
    expect(page.style.backgroundImage).toBe(`url("${backgrounds[season]}")`);
  });

  it.each([
    ['2027-03-01T00:00:00Z', 'winter', 'spring'],
    ['2027-05-31T23:00:00Z', 'spring', 'summer'],
    ['2027-08-31T23:00:00Z', 'summer', 'fall'],
    ['2027-12-01T00:00:00Z', 'fall', 'winter'],
    ['2028-03-01T00:00:00Z', 'winter', 'spring'],
  ])('switches at London midnight %s without a reload', (midnight, before, after) => {
    vi.setSystemTime(new Date(new Date(midnight).getTime() - 1));
    const { page } = mount(bodyId);
    expect(page.dataset.igniteSeason).toBe(before);
    vi.advanceTimersByTime(1);
    expect(page.dataset.igniteSeason).toBe(after);
    expect(page.style.backgroundImage).toBe(`url("${backgrounds[after]}")`);
  });
});

it('keeps winter across New Year', () => {
  vi.setSystemTime(new Date('2027-12-31T23:59:59.999Z'));
  const { page } = mount();
  vi.advanceTimersByTime(1);
  expect(page.dataset.igniteSeason).toBe('winter');
});

it.each(['pageshow', 'visibilitychange'])('refreshes a restored or sleeping tab on %s', (event) => {
  vi.setSystemTime(new Date('2027-11-30T12:00:00Z'));
  const { page, events } = mount();
  vi.setSystemTime(new Date('2027-12-01T00:00:00Z'));
  events.get(event)!();
  expect(page.dataset.igniteSeason).toBe('winter');
  expect(vi.getTimerCount()).toBe(1);
});

it('does not add duplicate timers if the enhancement runs again', () => {
  const { context } = mount();
  runInNewContext(source, context);
  expect(vi.getTimerCount()).toBe(1);
});

it('does not change other Moodle pages', () => {
  const { page, events } = mount('page-course-view');
  expect(page.style.backgroundImage).toBe('');
  expect(events.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});
