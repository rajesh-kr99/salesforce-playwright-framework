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
  // Also support URLs without the object name in the path
  const fallbackRegex = new RegExp(`/r/([a-zA-Z0-9]{15,18})/view`);
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeoutMs) {
    attempt++;

    // Strategy 1 — check page.url() with object name
    const url = page.url();
    const match = url.match(regex);
    if (match?.[1]) {
      console.log(`✅ [extractSalesforceId] Found ID in URL (attempt ${attempt}): ${match[1]}`);
      return match[1];
    }

    // Strategy 2 — check page.url() with fallback pattern (without object name)
    const fallbackMatch = url.match(fallbackRegex);
    if (fallbackMatch?.[1]) {
      console.log(`✅ [extractSalesforceId] Found ID in URL using fallback pattern (attempt ${attempt}): ${fallbackMatch[1]}`);
      return fallbackMatch[1];
    }

    // Strategy 3 — check window.location.href in the browser context
    const href = await page.evaluate(() => window.location.href);
    const match2 = href.match(regex);
    if (match2?.[1]) {
      console.log(`✅ [extractSalesforceId] Found ID in window.href (attempt ${attempt}): ${match2[1]}`);
      return match2[1];
    }

    // Strategy 4 — check window.location.href with fallback pattern
    const fallbackMatch2 = href.match(fallbackRegex);
    if (fallbackMatch2?.[1]) {
      console.log(`✅ [extractSalesforceId] Found ID in window.href using fallback pattern (attempt ${attempt}): ${fallbackMatch2[1]}`);
      return fallbackMatch2[1];
    }

    // If first attempt fails and URL doesn't have object name, try reloading once
    if (attempt === 1 && !url.includes(`/${objectName}/`)) {
      console.log(`⚠️ [extractSalesforceId] URL missing object name, attempting reload...`);
      try {
        await page.reload({ waitUntil: 'load', timeout: 3000 });
        await page.waitForTimeout(500);
        continue;
      } catch (error) {
        console.log(`⚠️ [extractSalesforceId] Reload failed, continuing with fallback patterns...`);
      }
    }

    console.log(`⏳ [extractSalesforceId] Attempt ${attempt}: waiting for record URL...`);
    await page.waitForTimeout(Math.min(500 * attempt, 2000)); // 0.5s → 2s backoff
  }

  throw new Error(`❌ Timed out after ${timeoutMs} ms waiting for ${objectName} record ID`);
}
