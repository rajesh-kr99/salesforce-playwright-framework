import { test, expect } from '../../fixtures/loginFixtures';
//import fs from 'fs';

test('Login to Salesforce', async ({ loginPage }) => {

  await expect(loginPage.page).toHaveURL(/lightning/);
  
});


