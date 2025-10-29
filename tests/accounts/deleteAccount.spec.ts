import { test, expect } from '../../fixtures/loginFixtures';
import { AccountPage } from '../../pages/AccountPage';
import accountData from '../../data/accountData.json';


test('Delete Salesforce Account', async ({ loginPage, page }) => {

  // Step 1: Use loginPage fixture (already logged in / page ready)
  const accountPage = new AccountPage(page);
  const { name, type } = accountData.singleAccount;

  // Step 2: Create Account
  
  const { accountName, accountId } = await accountPage.createAccount(name, type);

    
  // Step 3: Edit Account
  await accountPage.deleteAccount(accountId);

});