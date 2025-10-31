import { test, expect } from '../../fixtures/loginFixtures';
import { AccountPage } from '../../pages/AccountPage';
import accountData from '../../data/accountData.json';


test('Create Salesforce Account', async ({ loginPage, page }) => {

  // Step 1: Use loginPage fixture (already logged in / page ready)
  const accountPage = new AccountPage(page);
  const { name, type } = accountData.singleAccount;

  // Step 2: Create Account
  const { accountName, accountId } = await accountPage.createAccount(name, type);
  
  // Step 3: Validate account was created
  expect(accountId).toBeTruthy();
  expect(accountId).toMatch(/^[a-zA-Z0-9]{15,18}$/); // Valid Salesforce ID format
  
  // Step 4: Validate account details
  await accountPage.validateAccountDetails(accountId, { name: accountName, type });
  
});

//Create multiple accounts with all account types
test('Create accounts for all account types', async ({ loginPage, page }) => {
  test.setTimeout(270000); // 270 seconds (4.5 minutes) for 6 account operations with validation navigation
  const accountPage = new AccountPage(page);

  for (const acc of accountData.allAccountTypes) {
    const { name, type } = acc;
    // Create account and get the details
    const { accountName, accountId } = await accountPage.createAccount(name, type);
    
    // Validate using separate navigation (more reliable than on-page validation due to Salesforce duplicates)
    await accountPage.validateAccountDetails(accountId, { name: accountName, type });
    
    // Additional validations
    expect(accountId).toBeTruthy();
    expect(accountId).toMatch(/^[a-zA-Z0-9]{15,18}$/);
  }
});

//Create accounts with edge case names
test('Create accounts with edge case names', async ({ loginPage, page }) => {
  test.setTimeout(180000); // 180 seconds (3 minutes) for 4 edge case accounts
  const accountPage = new AccountPage(page);

  for (const acc of accountData.edgeCases) {
    const { name, type, description } = acc;
    console.log(`🧪 Testing edge case: ${description}`);
    
    // Create account and get the details
    const { accountName, accountId } = await accountPage.createAccount(name, type);
    
    // Validate using separate navigation (more reliable than on-page validation due to Salesforce duplicates)
    await accountPage.validateAccountDetails(accountId, { name: accountName, type });
    
    // Additional validations
    expect(accountId).toBeTruthy();
    expect(accountId).toMatch(/^[a-zA-Z0-9]{15,18}$/);
  }
});