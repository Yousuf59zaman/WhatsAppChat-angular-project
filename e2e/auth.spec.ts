import { test, expect } from '@playwright/test';

// NOTE: Without a real backend, these tests assume front-end only behavior or will be marked skipped.

const uniqueEmail = () => `user_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;

// Helper selectors (consider adding data-testid attributes in templates for stability):
const sel = {
  loginEmail: '#email',
  loginPassword: '#password',
  submitBtn: 'button:has-text("Sign in")',
  registerLink: 'a:has-text("Register")',
  registerEmail: '#email',
  registerPassword: '#password',
  createAccountBtn: 'button:has-text("Create account")'
};

// Registration flow (may fail if backend not implemented). Using skip for now.
test.skip('user can register', async ({ page }) => {
  await page.goto('/register');
  const email = uniqueEmail();
  await page.fill(sel.registerEmail, email);
  await page.fill(sel.registerPassword, 'Password123!');
  await page.click(sel.createAccountBtn);
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/login|home/);
});

// Login flow baseline
// If no backend, this likely shows validation error; we assert that validation triggers.
test('login form validation', async ({ page }) => {
  await page.goto('/login');
  await page.click(sel.submitBtn);
  // Expect some error text in DOM after attempted submit.
  const error = page.locator('text=Password is required');
  await expect(error).toBeVisible();
});
