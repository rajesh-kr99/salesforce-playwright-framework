import { Page } from '@playwright/test';

/**
 * Waits until a Salesforce record URL contains an ID,
 * and extracts the 15- or 18-character Salesforce record ID.
 *
 * @param page Playwright Page instance
 * @param objectName Salesforce object name (e.g., "Account", "Opportunity")
 * @param timeout Maximum time to wait in milliseconds (default: 10s)
 * @returns The Salesforce record ID as a string
 */
export async function extractSalesforceId(
  page: Page,
  objectName: string,
  timeout = 10000
): Promise<string> {
  const regex = new RegExp(`${objectName}/([a-zA-Z0-9]{15,18})/view`);
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const url = page.url();
    const match = url.match(regex);

    if (match && match[1]) {
      const id = match[1];
      return id; // ✅ return the extracted ID
    }

    // Retry every 0.5 seconds until it appears
    await page.waitForTimeout(500);
  }

  throw new Error(`❌ Timed out after ${timeout}ms waiting for ${objectName} ID in URL`);
}
