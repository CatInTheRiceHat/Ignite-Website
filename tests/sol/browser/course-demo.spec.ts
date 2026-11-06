import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { questionSets, type DemoQuestion } from '../../../src/data/demo/questions';
import { casePrompts, lessonChecks, parts, responseCheck } from '../../../src/data/demo/week';

async function answer(page: Page, question: DemoQuestion) {
  const card = page.locator('.demo-question').filter({ has: page.getByRole('group', { name: question.prompt, exact: true }) });
  await card.getByRole('radio', { name: question.options.find(o => o.correct)!.text, exact: true }).check();
  await card.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(card.getByRole('status')).toContainText('Correct');
  await expect(card.getByRole('status')).toBeFocused();
}
async function part(page: Page, title: string) {
  await page.getByRole('navigation', { name: 'Sample week parts' }).getByRole('button', { name: title }).click();
  await expect(page.locator('#part-title')).toBeFocused();
  await expect(page.locator('#part-title')).toBeInViewport();
  const header = await page.locator('.demo-part-header').boundingBox();
  const jump = page.locator('.demo-mobile-jump');
  if (await jump.isVisible()) {
    const bar = await jump.boundingBox();
    expect(header!.y).toBeGreaterThanOrEqual(bar!.y + bar!.height);
  }
}
async function axe(page: Page) {
  const result = await new AxeBuilder({ page }).include('.course-demo').analyze();
  expect(result.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test('a visitor can complete the actual week, revise, resume, download and reset', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo/boundaries?utm_source=outreach');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Relationships, Boundaries & Social Skills');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.locator('sol-widget')).toHaveCSS('display', 'none');
  await expect(page).toHaveTitle('What Are Boundaries? · Try a Sample Week | Ignite');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ignitefindyourfire.org/demo/boundaries');
  await axe(page);
  await page.getByRole('button', { name: 'Start the sample week', exact: true }).click();
  await expect(page).toHaveURL(/utm_source=outreach&part=learn/);
  const first = page.locator('.demo-question').first();
  await first.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await first.getByRole('button', { name: 'Get a hint' }).click();
  await expect(first.locator('.demo-hint')).toBeVisible();
  await first.getByRole('button', { name: 'Check answer' }).click();
  await expect(first.getByRole('status')).toContainText('Review this answer');
  await expect(first.getByRole('status')).toBeFocused();
  await expect(first.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  await expect(first.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
  await first.getByRole('button', { name: 'Try again' }).click();
  await expect(first.getByRole('radio').first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(first.getByRole('radio').nth(1)).toBeChecked();
  for (const q of lessonChecks) await answer(page, q);
  const examples = {
    physical: 'Ava says, “No hug, thanks.”',
    emotional: 'Ben chooses not to discuss a private worry.',
    time: 'Rosa logs off at nine so she can rest.',
    belongings: 'Marcus asks friends to get permission before borrowing his hoodie.',
    digital: 'Jada asks her friend to remove a photo of her.',
  };
  for (const [type, text] of Object.entries(examples)) await page.locator(`#note-example-${type}`).fill(text);
  await axe(page);
  await page.getByRole('button', { name: 'Mark this part complete', exact: true }).click();
  await expect(page.locator('.demo-progress-heading')).toContainText('1 / 8 complete');
  await page.reload();
  await expect(page.locator('.demo-progress-heading')).toContainText('1 / 8 complete');
  await expect(page.getByRole('navigation', { name: 'Sample week timeline' }).getByRole('button', { name: /What are boundaries/ })).toContainText('Complete');
  for (const [name, title] of [['warmup', 'Try it out'], ['types', 'Which boundary is it?'], ['choices', 'Limits that protect your needs'], ['final', 'Week 1 assessment']] as const) {
    await part(page, title);
    for (const [i, q] of questionSets[name].entries()) {
      await answer(page, q);
      if (i < questionSets[name].length - 1) await page.getByRole('button', { name: 'Next question', exact: true }).click();
    }
    await expect(page.locator('.demo-complete-label')).toBeVisible();
    if (name === 'types') await axe(page);
  }
  await part(page, 'Meet the friend group');
  await page.getByText('Inside the hoodie story: Marcus’s perspective', { exact: true }).click();
  await expect(page.getByText(/That hoodie was my older brother’s before/)).toBeVisible();
  await page.getByRole('button', { name: 'Mark this part complete', exact: true }).click();
  await part(page, 'The Borrowed Hoodie');
  await answer(page, responseCheck);
  for (const prompt of casePrompts.filter(p => p.required)) await page.locator(`#note-${prompt.id}`).fill(`Fictional response for ${prompt.id}: Priya took the hoodie without asking, and Marcus can choose what happens next.`);
  for (const checkbox of await page.locator('.demo-rubric input').all()) await checkbox.check();
  await axe(page);
  await page.getByRole('button', { name: 'Save my case study', exact: true }).click();
  await part(page, 'My Boundaries Map');
  const fields = {
    'map-boundary': 'Belongings and digital privacy protect Marcus’s choices.',
    'map-evidence': 'Priya took the special hoodie and posted a photo.',
    'map-response': 'Please return my hoodie and ask before borrowing my things.',
    'map-next': 'Marcus can ask a trusted adult for support if his request is ignored.',
  };
  for (const [id, text] of Object.entries(fields)) await page.locator(`#note-${id}`).fill(text);
  await page.getByRole('button', { name: 'Complete the sample week', exact: true }).click();
  await expect(page.locator('.demo-progress-heading')).toContainText('8 / 8 complete');
  await expect(page.getByRole('heading', { name: 'You finished the sample week.' })).toBeVisible();
  await axe(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download my workbook', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('ignite-boundaries-week-1.txt');
  const stream = await download.createReadStream();
  const buffers = [];
  for await (const chunk of stream!) buffers.push(chunk);
  const text = Buffer.concat(buffers).toString('utf8');
  expect(text).toContain(fields['map-response']);
  expect(text).toContain('Completed parts: 8 of 8');
  await page.reload();
  await expect(page.locator('.demo-progress-heading')).toContainText('8 / 8 complete');
  await expect(page.locator('#note-map-response')).toHaveValue(fields['map-response']);
  await part(page, 'Meet the friend group');
  await page.locator('#note-perspective').fill('Ella notices Marcus’s concern while Priya assumes he is comfortable.');
  await expect(page.locator('.demo-progress-heading')).toContainText('8 / 8 complete');
  await part(page, 'The Borrowed Hoodie');
  await page.locator('#note-marcus').fill('Marcus wants his brother’s hoodie back. Priya was responsible for asking before taking it.');
  await expect(page.locator('.demo-rubric input').nth(1)).not.toBeChecked();
  await expect(page.locator('.demo-progress-heading')).toContainText('6 / 8 complete');
  await page.locator('.demo-rubric input').nth(1).check();
  await page.getByRole('button', { name: 'Save my case study', exact: true }).click();
  await part(page, 'My Boundaries Map');
  await page.getByRole('button', { name: 'Complete the sample week', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Explore Ignite courses', exact: true })).toHaveAttribute('href', '/program#course-catalog');
  await page.getByRole('link', { name: 'Explore Ignite courses', exact: true }).click();
  await expect(page).toHaveURL(/\/program#course-catalog$/);
  await expect(page.getByRole('button', { name: 'Ask Sol', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.demo-progress-heading')).toContainText('8 / 8 complete');
  await expect(page.locator('sol-widget')).toHaveCSS('display', 'none');
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my progress', exact: true }).click();
  await expect(page.locator('.demo-progress-heading')).toContainText('8 / 8 complete');
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await page.getByRole('button', { name: 'Reset everything', exact: true }).click();
  await expect(page.locator('.demo-progress-heading')).toContainText('0 / 8 complete');
  await page.reload();
  await expect(page.locator('.demo-progress-heading')).toContainText('0 / 8 complete');
});

test('direct section links work without storage and the sample is discoverable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage disabled'); }; });
  await page.goto('/demo/boundaries/?part=case');
  await expect(page.locator('#part-title')).toHaveText('The Borrowed Hoodie');
  await expect(page.locator('#part-title')).toBeFocused();
  await expect(page.locator('#part-title')).toBeInViewport();
  await expect(page.locator('.demo-save-note')).toContainText('Browser saving is unavailable');
  await page.locator('#note-evidence').fill('A fictional character’s belongings were taken without permission.');
  await expect(page.locator('#note-evidence')).toHaveValue(/fictional/);
  await page.goto('/program');
  await page.getByRole('link', { name: 'Explore a sample week', exact: true }).click();
  await expect(page).toHaveURL('/demo/boundaries');
  await page.goto('/');
  const feature = page.getByRole('region', { name: 'This Month’s Featured Course' });
  await expect(feature).toContainText('Nikhil Tadepalli');
  const featureScan = await new AxeBuilder({ page }).include('#featured-course').analyze();
  expect(featureScan.violations).toEqual([]);
  await feature.getByRole('link', { name: 'Try a sample week', exact: true }).click();
  await expect(page.locator('#part-title')).toContainText('Explore the week');
  const timeline = page.getByRole('navigation', { name: 'Sample week timeline' });
  await expect(timeline.getByRole('button')).toHaveCount(parts.length);
  for (const [index, item] of parts.entries()) {
    await timeline.getByRole('button').nth(index).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#part-title')).toHaveText(item.title);
    await expect(page.locator('#part-title')).toBeFocused();
    await expect(timeline.getByRole('button').nth(index)).toHaveAttribute('aria-current', 'step');
  }
  const jump = page.getByLabel('Jump to a part', { exact: false });
  if (await jump.isVisible()) {
    await jump.selectOption('choices');
    await expect(page.locator('#part-title')).toBeFocused();
    await expect(page.locator('#part-title')).toHaveText('Limits that protect your needs');
    await page.reload();
    await expect(jump).toHaveValue('choices');
    await axe(page);
  }
});

for (const denyRemoval of [false, true]) {
  test(`reset handles unavailable writes with removal ${denyRemoval ? 'denied' : 'allowed'}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(({ denyRemoval }) => {
      const key = 'ignite:boundaries-week:v1';
      if (!sessionStorage.getItem('seeded-demo-review')) {
        localStorage.setItem(key, JSON.stringify({ version: 1, done: ['friends'], notes: { evidence: 'Private fictional draft for storage recovery.' } }));
        sessionStorage.setItem('seeded-demo-review', 'yes');
      }
      const set = Storage.prototype.setItem;
      const remove = Storage.prototype.removeItem;
      Storage.prototype.setItem = function (name, value) {
        if (name === key) throw new DOMException('Storage full', 'QuotaExceededError');
        set.call(this, name, value);
      };
      Storage.prototype.removeItem = function (name) {
        if (denyRemoval && name === key) throw new DOMException('Storage denied', 'SecurityError');
        remove.call(this, name);
      };
    }, { denyRemoval });
    await page.goto('/demo/boundaries?part=case');
    await expect(page.locator('#note-evidence')).toHaveValue('Private fictional draft for storage recovery.');
    await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
    await page.getByRole('button', { name: 'Reset everything', exact: true }).click();
    await expect(page.locator('.demo-progress-heading')).toContainText('0 / 8 complete');
    if (denyRemoval) {
      await expect(page.locator('.demo-announcement')).toContainText('saved work could not be cleared');
    } else {
      await expect(page.locator('.demo-announcement')).toContainText('Demo progress reset');
      await page.reload();
      await page.getByRole('navigation', { name: 'Sample week parts' }).getByRole('button', { name: 'The Borrowed Hoodie' }).click();
      await expect(page.locator('#note-evidence')).toHaveValue('');
    }
  });
}
