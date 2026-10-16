import { expect, it } from 'vitest';
import { getGoogleFormLinks } from '../src/lib/links';

it('embeds a full Google Form URL and preserves its prefilled values', () => {
  const form = getGoogleFormLinks(' https://docs.google.com/forms/d/e/confirmed-form/viewform?entry.123=School&embedded=true ');
  expect(form?.url).toBe('https://docs.google.com/forms/d/e/confirmed-form/viewform?entry.123=School');
  expect(form?.embedUrl).toBe('https://docs.google.com/forms/d/e/confirmed-form/viewform?entry.123=School&embedded=true');
});

it('supports full Google Form URLs with an account index', () => {
  expect(getGoogleFormLinks('https://docs.google.com/forms/u/0/d/form-id/viewform')?.embedUrl)
    .toBe('https://docs.google.com/forms/u/0/d/form-id/viewform?embedded=true');
});

it('offers a short form link without inventing an embed URL', () => {
  expect(getGoogleFormLinks('https://forms.gle/confirmed-form'))
    .toEqual({ url: 'https://forms.gle/confirmed-form', embedUrl: null });
});

it.each([
  '', 'not a URL', 'javascript:alert(1)', 'http://forms.gle/form-id',
  'https://docs.google.com/forms/d/form-id/edit',
  'https://docs.google.com/forms/d/form-id/formResponse',
  'https://docs.google.com.evil.example/forms/d/form-id/viewform',
  'https://forms.gle/', 'https://example.com/form',
  'https://user:password@forms.gle/form-id',
])('hides application actions for an empty or unsupported URL: %s', value => {
  expect(getGoogleFormLinks(value)).toBeNull();
});
