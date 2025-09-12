import { test, expect } from '@playwright/test';

// This is largely placeholder since sending messages likely needs auth + backend.

test.describe.skip('messages flow (placeholder)', () => {
  test('open conversation and send message', async ({ page }) => {
    await page.goto('/conversations');
    // Click first conversation if present
    const firstConv = page.locator('ul >> li').first();
    if (await firstConv.isVisible()) {
      await firstConv.click();
    }
    // Navigate manually to a fake conversation id route
    await page.goto('/messages/demo-conv');
    const input = page.locator('input[placeholder="Type a message"]');
    await input.fill('Hello world');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Hello world').first()).toBeVisible();
  });
});
