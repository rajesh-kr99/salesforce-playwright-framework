import { test, expect } from '../../fixtures/loginFixtures';
import { AccountPage } from '../../pages/AccountPage';
import accountData from '../../data/accountData.json';


test('Create Salesforce Account', async ({ loginPage, page }) => {

  // Step 1: Use loginPage fixture (already logged in / page ready)
  const accountPage = new AccountPage(page);
  const { name, type } = accountData.singleAccount;

  // Step 2: Create Account
  
  const { accountName, accountId } = await accountPage.createAccount(name, type);

  console.log(`✅ Created single account: ${accountName} (${type})`);
  expect(accountId).toBeTruthy();
  
});


test('Create multiple Salesforce accounts', async ({ loginPage, page }) => {
  const accountPage = new AccountPage(page);

  for (const acc of accountData.multipleAccounts) {
    const { name, type } = acc;
    const { accountName, accountId } = await accountPage.createAccount(name, type);

    console.log(`✅ Created account: ${accountName} (${type})`);
    expect(accountId).toBeTruthy();
  }
});