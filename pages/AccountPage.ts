import { Page, Locator, expect } from '@playwright/test';
import { waitForRecordUrl } from '../utils/waitHelpers';
import { extractSalesforceId } from '../utils/idExtractionHelpers';

export class AccountPage {
  readonly page: Page;
  readonly newButton: Locator;
  readonly accountNameInput: Locator;
  readonly accountTypeDropdown: Locator;
  readonly saveButton: Locator;
  readonly showMoreActionsButton: Locator;
  readonly menuItemEdit: Locator;
  readonly accountNumber: Locator;
  readonly menuItemDelete: Locator;
  readonly deleteButton: Locator;
  readonly typeDropDown: Locator;
  
  
  

  constructor(page: Page) {
    this.page = page;
    this.newButton = page.getByRole('button', { name: 'New' });
    this.accountNameInput = page.getByRole('textbox', { name: 'Account Name' });
    this.accountTypeDropdown = page.getByRole('combobox', { name: 'Type' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.showMoreActionsButton = page.getByRole('button', { name: 'Show more actions' });
    this.menuItemEdit = page.getByRole('menuitem', { name: 'Edit' });
    this.accountNumber = page.getByRole('textbox', { name: 'Account Number' });
    this.menuItemDelete = page.getByRole('menuitem', { name: 'Delete' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.typeDropDown = page.getByRole('combobox', { name: 'Type' });
    
  }

  async navigateToAccounts() {
    const accountsUrl = process.env.SALESFORCE_ACCOUNTS_URL!;
    await this.page.goto(accountsUrl, { waitUntil: 'domcontentloaded' });
  }

async createAccount(baseName: string, baseType: string): Promise<{ accountName: string; accountId: string }> {
  await this.navigateToAccounts();

  // Use timestamp to make it unique for each run
  const accountName = `${baseName}_${Date.now()}`;
  

  await this.newButton.click();
  await this.accountNameInput.fill(accountName);
  await this.typeDropDown.click();
  //await this.page.getByText(baseType, {exact: true}).click();

// Wait for the overlay with the combobox items to appear
await this.page.waitForSelector('[data-value]', { state: 'visible', timeout: 5000 });

// Click the item matching your value
await this.page.locator(`[data-value="${baseType}"]`).click();


  await this.saveButton.click();

  // Verify success toast or record page
  await expect(this.page.getByText('was created')).toBeVisible({ timeout: 10000 });
  console.log(`✅ Created Account: ${accountName}`);

  // Wait for navigation and capture the new record URL

  await waitForRecordUrl(this.page, 10000);

  // ✅ Extract and return the record ID
  const accountId = await extractSalesforceId(this.page, 'Account', 10000);

  if (!accountId) {
    throw new Error('❌ Unable to extract Account ID from URL');
  }

  console.log(`✅ Created Account: ${accountName} | ID: ${accountId}`);

  // ✅ Return both values as an object
  return { accountName, accountId };
}

async editAccount(accountId: string): Promise<void> {
  // Construct the Salesforce record URL
  const accountRUrl = `${process.env.SALESFORCE_ACCOUNTS_R_URL}${accountId}/view`;

  console.log(`🔄 Editing Account: ${accountId}`);
  await this.page.goto(accountRUrl, { waitUntil: 'domcontentloaded' });

 //Click Showmore actions
  await this.showMoreActionsButton.click();

  // Click Edit button
  await this.menuItemEdit.click();

  // Example: update a field
  //await this.page.locator('input[name="AccountNumber"]').fill(`ACC-${Date.now()}`);
  await this.accountNumber.fill(`ACC-${Date.now()}`);


  // Save the record
  await this.saveButton.click();

  // Verify update success
  await expect(this.page.getByText('was saved')).toBeVisible({ timeout: 10000 });

  console.log(`✅ Account ${accountId} successfully updated`);
}

async deleteAccount(accountId: string): Promise<void> {
  // Construct the Salesforce record URL
  const accountRUrl = `${process.env.SALESFORCE_ACCOUNTS_R_URL}${accountId}/view`;

  console.log(`🔄 Deleting Account: ${accountId}`);
  await this.page.goto(accountRUrl, { waitUntil: 'domcontentloaded' });

 //Click Showmore actions
  await this.showMoreActionsButton.click();

  // Click Delete button
  await this.menuItemDelete.click();

  //Confirm Delete
  await this.deleteButton.click();

 
  // Verify update success
  await expect(this.page.getByText('was deleted')).toBeVisible({ timeout: 10000 });

  console.log(`✅ Account ${accountId} successfully updated`);
}
}
