import { Page, Locator, expect } from '@playwright/test';

/**
 * Waits until the Salesforce record page URL is loaded.
 * Example match: /lightning/r/Account/001XXXXXXXXXXXX/view
 */
export async function waitForRecordUrl(page: Page, timeout = 10000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const currentUrl = page.url();
    if (currentUrl.includes('/lightning/r/')) {
      console.log(`✅ [waitForRecordUrl] Record page URL detected: ${currentUrl}`);
      return; // ✅ Correct URL loaded
    }
    await page.waitForTimeout(500); // Check every 0.5s
  }
  throw new Error(`❌ Timed out after ${timeout}ms waiting for record page URL`);
}

/**
 * Waits for the Salesforce Lightning page to fully load.
 * Handles delayed LWC rendering and network idle states.
 */
export async function waitForLightningLoad(page: Page, timeout = 15000) {
  console.log('⚡ Waiting for Lightning page to load...');
  const start = Date.now();

  await page.waitForLoadState('domcontentloaded');
  //await page.waitForLoadState('networkidle');

  // Wait for key LWC elements to render
  await page.waitForFunction(
    () => !!document.querySelector('lightning-formatted-text, lightning-input, one-appnav'),
    { timeout }
  );

  console.log(`✅ [waitForLightningLoad] Lightning UI ready in ${Date.now() - start}ms`);
}

/**
 * Waits until text becomes visible on screen, retrying until timeout.
 * Works around Salesforce’s delayed DOM rendering and hidden components.
 */
export async function expectTextVisible(
  page: Page,
  text: string,
  timeout = 10000,
  options?: { exact?: boolean }
) {
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeout) {
    attempt++;
    const locator = page.locator(`text=${options?.exact ? `"${text}"` : text}`);
    const visible = await locator.isVisible().catch(() => false);
    if (visible) {
      console.log(`✅ [expectTextVisible] "${text}" found (attempt ${attempt})`);
      return;
    }

    console.log(`⏳ [expectTextVisible] "${text}" not visible yet (attempt ${attempt})`);
    await page.waitForTimeout(Math.min(500 * attempt, 2000)); // Backoff 0.5s → 2s
  }

  throw new Error(`❌ "${text}" not visible after ${timeout}ms`);
}

/**
 * Waits for a given locator to become visible.
 * Retries gracefully for Lightning components that render asynchronously.
 */
export async function waitForLocatorVisible(
  locator: Locator,
  timeout = 10000
): Promise<void> {
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeout) {
    attempt++;
    const visible = await locator.isVisible().catch(() => false);
    if (visible) {
      console.log(`✅ [waitForLocatorVisible] Locator visible (attempt ${attempt})`);
      return;
    }
    await locator.page().waitForTimeout(Math.min(500 * attempt, 2000));
  }

  throw new Error(`❌ Locator not visible after ${timeout}ms`);
}

/**
 * Retries a function until it succeeds or runs out of attempts.
 * Great for polling APIs, SOQL, or dynamic UI.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delayMs?: number; onRetry?: (err: unknown, attempt: number) => void } = {}
): Promise<T> {
  const { retries = 5, delayMs = 1000, onRetry } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      onRetry?.(err, attempt);
      console.warn(`🔁 [retry] Attempt ${attempt}/${retries} failed: ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('❌ [retry] Exceeded maximum retries');
}
