import { Page, Locator, expect } from '@playwright/test';
import { waitForRecordUrl } from '../utils/waitHelpers';
import { extractSalesforceId } from '../utils/idExtractionHelpers';

export class AccountPage {
  readonly page: Page;
  readonly newButton: Locator;
  readonly accountNameInput: Locator;
  readonly typeDropDown: Locator;
  readonly saveButton: Locator;
  readonly showMoreActionsButton: Locator;
  readonly menuItemEdit: Locator;
  readonly accountNumber: Locator;
  readonly menuItemDelete: Locator;
  readonly deleteButton: Locator;
  readonly phoneInput: Locator;
  readonly websiteInput: Locator;
  readonly employeesInput: Locator;
  

  constructor(page: Page) {
    this.page = page;
    this.newButton = page.getByRole('button', { name: 'New' });
    this.accountNameInput = page.getByRole('textbox', { name: 'Account Name' });
    this.typeDropDown = page.getByRole('combobox', { name: 'Type' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.showMoreActionsButton = page.getByRole('button', { name: 'Show more actions' });
    this.menuItemEdit = page.getByRole('menuitem', { name: 'Edit' });
    this.accountNumber = page.getByRole('textbox', { name: 'Account Number' });
    this.menuItemDelete = page.getByRole('menuitem', { name: 'Delete' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone' });
    this.websiteInput = page.getByRole('textbox', { name: 'Website' });
    this.employeesInput = page.getByRole('textbox', { name: 'Employees' });
  }

  async navigateToAccounts() {
    const accountsUrl = process.env.SALESFORCE_ACCOUNTS_URL!;
    await this.page.goto(accountsUrl, { waitUntil: 'load', timeout: 30000 });
    
    // Wait for Lightning components to render
    await this.page.waitForTimeout(2000);
  }

  /**
   * Helper method to handle Salesforce combobox selection with multiple fallback strategies
   * Salesforce uses dynamic locators, so this tries multiple approaches
   */
  private async selectFromSalesforceDropdown(dropdown: Locator, value: string) {
    // Click to open dropdown
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    await dropdown.click();
    
    // Wait for dropdown options to populate (not just listbox appearing)
    await this.page.waitForTimeout(1000);
    
    // Wait for actual options to be visible with extended timeout for reliability
    await this.page.waitForSelector('[role="option"]', { 
      state: 'visible', 
      timeout: 10000 
    });
    
    // Try multiple strategies in order of reliability
    const strategies = [
      // Strategy 1: data-value attribute (most reliable)
      () => this.page.locator(`[role="option"][data-value="${value}"]`).click({ timeout: 2000 }),
      
      // Strategy 2: lightning-base-combobox-item with data-value
      () => this.page.locator(`lightning-base-combobox-item[data-value="${value}"]`).click({ timeout: 2000 }),
      
      // Strategy 3: Exact text match within option role
      () => this.page.locator(`[role="option"]:has-text("${value}")`).first().click({ timeout: 2000 }),
      
      // Strategy 4: Title attribute
      () => this.page.locator(`[title="${value}"][role="option"]`).click({ timeout: 2000 }),
      
      // Strategy 5: Span text within listbox
      () => this.page.locator(`[role="listbox"] span:text-is("${value}")`).first().click({ timeout: 2000 })
    ];
    
    let lastError: Error | null = null;
    for (const strategy of strategies) {
      try {
        await strategy();
        // Verify selection worked by waiting a bit
        await this.page.waitForTimeout(300);
        return; // Success!
      } catch (error) {
        lastError = error as Error;
        continue; // Try next strategy
      }
    }
    
    // If all strategies failed, throw the last error
    throw new Error(`Failed to select "${value}" from dropdown after trying all strategies. Last error: ${lastError?.message}`);
  }

async createAccount(baseName: string, baseType: string): Promise<{ accountName: string; accountId: string }> {
  await this.navigateToAccounts();

  // Use timestamp to make it unique for each run
  const accountName = `${baseName}_${Date.now()}`;
  
  // ✅ FIX 1: Ensure New button is ready and wait for modal to load
  await this.newButton.waitFor({ state: 'visible', timeout: 10000 });
  await this.newButton.click();
  
  // Wait for the Account Name input to be fully ready (visible + editable)
  await this.accountNameInput.waitFor({ state: 'visible', timeout: 10000 });
  
  // Additional wait for element to be fully interactive (handle modal animation delays)
  await this.page.waitForTimeout(1000);
  
  // Ensure the input is enabled before filling
  await expect(this.accountNameInput).toBeEnabled({ timeout: 5000 });
  
  await this.accountNameInput.fill(accountName);
  
  // ✅ FIX 2: Use robust dropdown selection helper
  await this.selectFromSalesforceDropdown(this.typeDropDown, baseType);

  // Small wait to ensure dropdown value is set before saving
  await this.page.waitForTimeout(500);
  
  await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
  await this.saveButton.click();

  // Verify success toast or record page - use .first() to avoid strict mode violation
  await expect(this.page.getByText('was created').first()).toBeVisible({ timeout: 10000 });

  // Wait for navigation and capture the new record URL
  await waitForRecordUrl(this.page, 10000);

  // ✅ Extract and return the record ID
  const accountId = await extractSalesforceId(this.page, 'Account', 10000);

  if (!accountId) {
    throw new Error('❌ Unable to extract Account ID from URL');
  }

  console.log(`✅ Created Account: ${accountName} (${baseType}) | ID: ${accountId}`);

  // ✅ Return both values as an object
  return { accountName, accountId };
}

async editAccount(accountId: string): Promise<string> {
  // Construct the Salesforce record URL
  const accountRUrl = `${process.env.SALESFORCE_ACCOUNTS_R_URL}${accountId}/view`;

  console.log(`🔄 Editing Account: ${accountId}`);
  await this.page.goto(accountRUrl, { waitUntil: 'load', timeout: 30000 });
  await this.page.waitForTimeout(2000);

  // Click Show more actions button
  await this.showMoreActionsButton.waitFor({ state: 'visible', timeout: 5000 });
  await this.showMoreActionsButton.click();

  // Click Edit button
  await this.menuItemEdit.waitFor({ state: 'visible', timeout: 5000 });
  await this.menuItemEdit.click();

  // Wait for edit form to load
  await this.accountNumber.waitFor({ state: 'visible', timeout: 5000 });
  
  // Update the account number field
  const newAccountNumber = `ACC-${Date.now()}`;
  await this.accountNumber.fill(newAccountNumber);

  // Save the record
  await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
  await this.saveButton.click();

  // Verify update success
  await expect(
    this.page.locator('[role="status"]').filter({ hasText: 'was saved' })
  ).toBeVisible({ timeout: 10000 });

  console.log(`✅ Account ${accountId} successfully updated with Account Number: ${newAccountNumber}`);
  
  return newAccountNumber;
}

/**
 * Edit account with multiple fields - flexible method for various edit scenarios
 */
async editAccountFields(
  accountId: string, 
  fields: { 
    name?: string;
    type?: string;
    phone?: string;
    website?: string;
    employees?: string;
    accountNumber?: string;
  }
): Promise<void> {
  const accountRUrl = `${process.env.SALESFORCE_ACCOUNTS_R_URL}${accountId}/view`;

  console.log(`🔄 Editing Account: ${accountId}`);
  await this.page.goto(accountRUrl, { waitUntil: 'load', timeout: 30000 });
  await this.page.waitForTimeout(2000);

  // Click Show more actions button
  await this.showMoreActionsButton.waitFor({ state: 'visible', timeout: 5000 });
  await this.showMoreActionsButton.click();

  // Click Edit button
  await this.menuItemEdit.waitFor({ state: 'visible', timeout: 5000 });
  await this.menuItemEdit.click();

  // Wait for edit form to load
  await this.page.waitForTimeout(2000);
  
  // Update fields based on what's provided
  if (fields.name !== undefined) {
    await this.accountNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await expect(this.accountNameInput).toBeEnabled({ timeout: 5000 });
    await this.accountNameInput.fill(fields.name);
    console.log(`✏️ Updated name to: ${fields.name}`);
  }

  if (fields.type !== undefined) {
    await this.typeDropDown.waitFor({ state: 'visible', timeout: 5000 });
    await this.selectFromSalesforceDropdown(this.typeDropDown, fields.type);
    console.log(`✏️ Updated type to: ${fields.type}`);
  }

  if (fields.phone !== undefined) {
    await this.phoneInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.phoneInput.fill(fields.phone);
    console.log(`✏️ Updated phone to: ${fields.phone}`);
  }

  if (fields.website !== undefined) {
    await this.websiteInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.websiteInput.fill(fields.website);
    console.log(`✏️ Updated website to: ${fields.website}`);
  }

  if (fields.employees !== undefined) {
    await this.employeesInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.employeesInput.fill(fields.employees);
    console.log(`✏️ Updated employees to: ${fields.employees}`);
  }

  if (fields.accountNumber !== undefined) {
    await this.accountNumber.waitFor({ state: 'visible', timeout: 5000 });
    await this.accountNumber.fill(fields.accountNumber);
    console.log(`✏️ Updated account number to: ${fields.accountNumber}`);
  }

  // Save the record
  await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
  await this.saveButton.click();

  // Verify update success
  await expect(
    this.page.locator('[role="status"]').filter({ hasText: 'was saved' })
  ).toBeVisible({ timeout: 10000 });

  console.log(`✅ Account ${accountId} successfully updated`);
}

async deleteAccount(accountId: string): Promise<void> {
  // Construct the Salesforce record URL
  const accountRUrl = `${process.env.SALESFORCE_ACCOUNTS_R_URL}${accountId}/view`;

  console.log(`🔄 Deleting Account: ${accountId}`);
  await this.page.goto(accountRUrl, { waitUntil: 'load', timeout: 30000 });
  await this.page.waitForTimeout(2000);

 //Click Showmore actions
  await this.showMoreActionsButton.waitFor({ state: 'visible', timeout: 5000 });
  await this.showMoreActionsButton.click();

  // Click Delete button
  await this.menuItemDelete.waitFor({ state: 'visible', timeout: 5000 });
  await this.menuItemDelete.click();

  //Confirm Delete
  await this.deleteButton.waitFor({ state: 'visible', timeout: 5000 });
  await this.deleteButton.click();

  // Wait for navigation away from the deleted record
  await this.page.waitForURL(/.*\/list\?.*/, { timeout: 10000 });
  
  // Verify success toast - use more flexible selector and wait strategy
  await expect(
    this.page.locator('[role="status"]').filter({ hasText: 'was deleted' })
  ).toBeVisible({ timeout: 10000 });

  console.log(`✅ Account ${accountId} successfully deleted`);
}

/**
 * Validates that an account exists and has the expected data
 */
async validateAccountDetails(
  accountId: string, 
  expectedData: { 
    name?: string; 
    type?: string;
    phone?: string;
    website?: string;
    employees?: string;
  }
): Promise<void> {
  const accountRUrl = `${process.env.SALESFORCE_ACCOUNTS_R_URL}${accountId}/view`;
  
  console.log(`🔍 Validating Account: ${accountId}`);
  await this.page.goto(accountRUrl, { waitUntil: 'load', timeout: 30000 });
  await this.page.waitForTimeout(2000);

  if (expectedData.name) {
    // Validate account name appears on the page
    await expect(
      this.page.locator(`[title="${expectedData.name}"]`).or(this.page.getByText(expectedData.name))
    ).toBeVisible({ timeout: 5000 });
    console.log(`✅ Account name validated: ${expectedData.name}`);
  }

  if (expectedData.type) {
    // Validate account type appears on the page - use first() to avoid strict mode violation
    await expect(
      this.page.getByText(expectedData.type).first()
    ).toBeVisible({ timeout: 5000 });
    console.log(`✅ Account type validated: ${expectedData.type}`);
  }

  if (expectedData.phone) {
    await expect(
      this.page.getByText(expectedData.phone).first()
    ).toBeVisible({ timeout: 5000 });
    console.log(`✅ Phone validated: ${expectedData.phone}`);
  }

  if (expectedData.website) {
    await expect(
      this.page.getByText(expectedData.website).first()
    ).toBeVisible({ timeout: 5000 });
    console.log(`✅ Website validated: ${expectedData.website}`);
  }

  if (expectedData.employees) {
    await expect(
      this.page.getByText(expectedData.employees).first()
    ).toBeVisible({ timeout: 5000 });
    console.log(`✅ Employees validated: ${expectedData.employees}`);
  }
}

/**
 * Verifies that a deleted account no longer exists (returns 404 or error page)
 */
async verifyAccountDeleted(accountId: string): Promise<void> {
  const accountRUrl = `${process.env.SALESFORCE_ACCOUNTS_R_URL}${accountId}/view`;
  
  console.log(`🔍 Verifying Account ${accountId} is deleted`);
  
  // Try to navigate to the deleted account URL
  const response = await this.page.goto(accountRUrl, { 
    waitUntil: 'load', 
    timeout: 30000 
  });
  
  await this.page.waitForTimeout(2000);

  // Check if redirected away from the account (Salesforce redirects deleted accounts to list page)
  const currentUrl = this.page.url();
  const isRedirectedToList = currentUrl.includes('/list') || !currentUrl.includes(accountId);
  
  // Check for error messages on the page
  const errorIndicators = [
    this.page.getByText("This page isn't available"),
    this.page.getByText("This record is not available"),
    this.page.getByText("You don't have access to this record"),
    this.page.locator('h1:has-text("Error")'),
  ];

  let errorFound = false;
  for (const indicator of errorIndicators) {
    if (await indicator.isVisible({ timeout: 1000 }).catch(() => false)) {
      errorFound = true;
      break;
    }
  }

  if (isRedirectedToList || errorFound) {
    console.log(`✅ Verified: Account ${accountId} no longer exists (redirected or error shown)`);
  } else {
    throw new Error(`Account ${accountId} still appears to exist after deletion`);
  }
}
}
