import { expect, test } from '@playwright/test';

test('uses Ignite APIs and links and preserves the conversation across website routes', async ({ page, baseURL }) => {
  const oldServiceRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('ignite-sol-chatbot.vercel.app')) oldServiceRequests.push(request.url());
  });
  await page.route('**/api/status', route => route.fulfill({ json: { available: true } }));
  await page.route('**/api/chat', async route => {
    expect(new URL(route.request().url()).origin).toBe(new URL(baseURL!).origin);
    await route.fulfill({ json: { answer: 'The learning hub opens Moodle sign-in. I can’t access your account.', destinationIds: ['learning', 'contact'] } });
  });
  await page.goto('/');
  await expect(page.locator('sol-widget')).toHaveCount(1);
  await page.getByRole('button', { name: 'Ask Sol', exact: true }).click();
  await expect(page.getByRole('link', { name: /^Explore the program/ })).toHaveAttribute('href', `${baseURL}/program`);
  await page.getByRole('textbox').fill('Where is the learning hub?');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: /^Learning Hub/ })).toHaveAttribute('href', 'https://learn.ignitefindyourfire.org');
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Explore Course Plans', exact: true }).click();
  await expect(page).toHaveURL(/\/program$/);
  await page.getByRole('button', { name: 'Ask Sol', exact: true }).click();
  await expect(page.locator('.sol-message')).toHaveCount(2);
  await expect(page.locator('sol-widget')).toHaveCount(1);
  expect(oldServiceRequests).toEqual([]);
});
