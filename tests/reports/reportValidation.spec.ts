//import { test, expect } from '@playwright/test';
//import { SalesforceApi } from '../../utils/salesforceApi';
//import { ReportsPage } from '../../pages/ReportsPage';

/*
test('Sales Report UI vs API validation', async ({ page, loginPage }) => {
  const reportsPage = new ReportsPage(page);

  // Step 1: Login (fixture)
  await loginPage.login();

  // Step 2: Open Report
  await reportsPage.openReport('Opportunities by Stage');
  await reportsPage.applyDateFilter('THIS QUARTER');

  // Step 3: Extract UI Data
  const uiAmounts = await reportsPage.getReportAmounts();
  console.log('UI Data:', uiAmounts);

  // Step 4: Fetch backend data via SOQL
  const records = await SalesforceApi.query(`
    SELECT Amount, StageName 
    FROM Opportunity 
    WHERE CALENDAR_QUARTER(CloseDate) = THIS_QUARTER
  `);
  const apiAmounts = records.map(r => String(r.Amount));
  console.log('API Data:', apiAmounts);

  // Step 5: Compare
  expect(uiAmounts).toEqual(expect.arrayContaining(apiAmounts));
});
*/