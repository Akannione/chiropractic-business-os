import { chromium } from '@playwright/test';

const baseURL = process.env.E2E_AUTH_FRONTEND_URL || 'http://localhost:5174';
const apiURL = process.env.E2E_AUTH_API_URL || 'http://localhost:4020/api';
const password = process.env.E2E_AUTH_PASSWORD || 'cbos-e2e-password';

const unauthenticated = await fetch(apiURL + '/inquiries?pageSize=1');
if (unauthenticated.status !== 401) {
  throw new Error('Expected protected API to return 401 without a staff token.');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  await page.goto(baseURL);
  await page.getByLabel('Staff Password').waitFor();
  await page.getByLabel('Staff Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByText('Incorrect password.').waitFor();

  await page.getByLabel('Staff Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByText('Good to see you.').waitFor();

  await page.reload();
  await page.getByText('Good to see you.').waitFor();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByLabel('Staff Password').waitFor();
  console.log('Auth smoke passed: 401 gate, rejected login, valid login, refresh, and logout.');
} finally {
  await browser.close();
}
