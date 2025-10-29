import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://nosoftware-data-5650.my.salesforce.com/');

  await page.getByRole('textbox', { name: 'Opportunity Name' }).click();
  await page.getByRole('textbox', { name: 'Opportunity Name' }).fill('Test Oppty 1');
  await page.getByRole('combobox', { name: 'Account Name' }).click();
  await page.getByText('TestAccount_Customer_1760542352428').click();
  await page.getByRole('textbox', { name: '*Close Date' }).click();
  await page.getByRole('button', { name: '16' }).click();
  await page.getByRole('combobox', { name: 'Stage' }).click();
  await page.locator('span').filter({ hasText: 'Qualify' }).first().click();
  await page.getByRole('combobox', { name: 'Stage' }).click();
  await page.getByRole('option', { name: 'Qualify' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
});

