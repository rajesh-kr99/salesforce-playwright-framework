import { Page } from '@playwright/test';

/**
 * Extracts Salesforce record ID from the current page URL
 * with smart retries and multiple detection strategies.
 *
 * @param page Playwright Page
 * @param objectName e.g. "Account", "Opportunity", "Lead"
 * @param timeoutMs Total timeout in ms (default 10s)
 * @returns Record ID string
 */
export async function extractSalesforceId(
  page: Page,
  objectName: string,
  timeoutMs = 10000
): Promise<string> {
  const regex = new RegExp(`${objectName}/([a-zA-Z0-9]{15,18})/view`);
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeoutMs) {
    attempt++;

    // Strategy 1 — check page.url()
    const url = page.url();
    const match = url.match(regex);
    if (match?.[1]) {
      console.log(`✅ [extractSalesforceId] Found ID in URL (attempt ${attempt}): ${match[1]}`);
      return match[1];
    }

    // Strategy 2 — check window.location.href in the browser context
    const href = await page.evaluate(() => window.location.href);
    const match2 = href.match(regex);
    if (match2?.[1]) {
      console.log(`✅ [extractSalesforceId] Found ID in window.href (attempt ${attempt}): ${match2[1]}`);
      return match2[1];
    }

    console.log(`⏳ [extractSalesforceId] Attempt ${attempt}: waiting for record URL...`);
    await page.waitForTimeout(Math.min(500 * attempt, 2000)); // 0.5s → 2s backoff
  }

  throw new Error(`❌ Timed out after ${timeoutMs} ms waiting for ${objectName} record ID`);
}
