import { test, expect } from '../../fixtures/loginFixtures';
import { AccountPage } from '../../pages/AccountPage';
import accountData from '../../data/accountData.json';


test('Edit Salesforce Account - Account Number', async ({ loginPage, page }) => {

  // Step 1: Use loginPage fixture (already logged in / page ready)
  const accountPage = new AccountPage(page);
  const { name, type } = accountData.singleAccount;
  
  // Step 2: Create Account
  const { accountName, accountId } = await accountPage.createAccount(name, type);
    
  // Step 3: Edit Account and return the new account number
  const newAccountNumber = await accountPage.editAccount(accountId);

  // Step 4: Validation is already done in editAccount method (checks "was saved" toast)
  // The save confirmation means the edit was successful
  console.log(`✅ Test completed: Account edited successfully with Account Number: ${newAccountNumber}`);

});

test('Edit Salesforce Account - Change Type', async ({ loginPage, page }) => {
  const accountPage = new AccountPage(page);
  const { original, updated } = accountData.editScenarios.typeChange;
  
  // Create account with original type
  const { accountName, accountId } = await accountPage.createAccount(original.name, original.type);
  
  // Edit account type
  await accountPage.editAccountFields(accountId, { type: updated.type });
  
  // Validate the type was updated
  await accountPage.validateAccountDetails(accountId, { 
    name: accountName, 
    type: updated.type 
  });
  
  console.log(`✅ Successfully changed account type from "${original.type}" to "${updated.type}"`);
});

test('Edit Salesforce Account - Multiple Fields', async ({ loginPage, page }) => {
  const accountPage = new AccountPage(page);
  const { original, updated } = accountData.editScenarios.multipleFields;
  
  // Create account
  const { accountName, accountId } = await accountPage.createAccount(original.name, original.type);
  
  // Edit multiple fields
  await accountPage.editAccountFields(accountId, {
    phone: updated.phone,
    website: updated.website
  });
  
  // Validate all updated fields
  await accountPage.validateAccountDetails(accountId, {
    name: accountName,
    phone: updated.phone,
    website: updated.website
  });
  
  console.log(`✅ Successfully updated multiple fields: phone and website`);
});

test('Edit Salesforce Account - Edge Case Name', async ({ loginPage, page }) => {
  const accountPage = new AccountPage(page);
  const { original, updated } = accountData.editScenarios.edgeCaseName;
  
  // Create account with standard name
  const { accountId } = await accountPage.createAccount(original.name, original.type);
  
  // Edit to name with special character
  const newNameWithTimestamp = `${updated.name}_${Date.now()}`;
  await accountPage.editAccountFields(accountId, { name: newNameWithTimestamp });
  
  // Validate the name was updated with special character
  await accountPage.validateAccountDetails(accountId, { 
    name: newNameWithTimestamp 
  });
  
  console.log(`✅ Successfully updated account name to edge case: "${newNameWithTimestamp}"`);
});