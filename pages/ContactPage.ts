import { Page, Locator, expect } from '@playwright/test';
import { waitForRecordUrl } from '../utils/waitHelpers';
import { extractSalesforceId } from '../utils/idExtractionHelpers';

export class ContactPage {
  readonly page: Page;
  readonly newButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly accountLookupInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;

    //Locators
    this.newButton = page.getByRole('button', { name: 'New' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.accountLookupInput = page.getByRole('combobox', { name: 'Account Name' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone' });
    this.saveButton = page.getByRole('button', { name: 'Save' }).first(); // Use first() for multiple matches
  }

  async navigateToContacts() {
    const contactsUrl = process.env.SALESFORCE_CONTACTS_URL!;
    await this.page.goto(contactsUrl, { waitUntil: 'domcontentloaded' });
  }

  async createUniqueLastName(lastName: string){
  const randomSuffix = Math.floor(Math.random() * 10000);
  const uniqueLastName = `${lastName}_${randomSuffix}`;
  return uniqueLastName;
  }

  async createUniqueEmail(firstName: string, uniqueLastName: string){
    const uniqueEmail = `${firstName}.${uniqueLastName}@example.com`;
    return uniqueEmail;
  }

  async createContact(firstName: string, lastName: string, accountName: string) {
    await this.navigateToContacts();

    // Generate unique identifiers
    const uniqueLastName = await this.createUniqueLastName(lastName); 
    const uniqueEmail = await this.createUniqueEmail(firstName, uniqueLastName);

    // Wait for New button and click
    await this.newButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.newButton.click();

    // Wait for form to load
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 10000 });

    // Fill form fields
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(uniqueLastName);
    
    // Handle Account lookup with retry mechanism
    console.log(`🔎 Starting account lookup for: ${accountName}`);
    
    let accountSelected = false;
    let attempt = 0;
    const maxAttempts = 3;
    
    while (!accountSelected && attempt < maxAttempts) {
      attempt++;
      console.log(`🔄 Account lookup attempt ${attempt}/${maxAttempts}`);
      
      try {
        // Clear and re-focus the field for each attempt
        await this.accountLookupInput.click();
        await this.page.waitForTimeout(300);
        await this.accountLookupInput.clear();
        await this.page.waitForTimeout(300);
        
        // Fill the account name (this triggers the search)
        await this.accountLookupInput.fill(accountName);
        
        // Wait for dropdown to appear with increased timeout
        await this.page.waitForSelector('lightning-base-combobox-item', { 
          state: 'visible', 
          timeout: 8000 
        });
        
        // Additional wait for all results to populate
        await this.page.waitForTimeout(1500);
        
        // Try to select from dropdown
        accountSelected = await this.selectAccountFromDropdown(accountName);
        
        if (accountSelected) {
          console.log(`✅ Account selected successfully on attempt ${attempt}`);
          break;
        } else {
          console.log(`⚠️  Selection failed on attempt ${attempt}, retrying...`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`⚠️  Error on attempt ${attempt}: ${errorMsg}`);
        if (attempt === maxAttempts) {
          throw new Error(`❌ Unable to select Account after ${maxAttempts} attempts: ${accountName}`);
        }
      }
    }
    
    if (!accountSelected) {
      throw new Error(`❌ Unable to select Account: ${accountName} from dropdown after ${maxAttempts} attempts`);
    }

    // Move focus away from the account field to ensure selection sticks
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(500);
    
    // Verify account was set by checking the input value
    const accountInputValue = await this.accountLookupInput.inputValue().catch(() => '');
    console.log(`📋 Account field value after selection: "${accountInputValue}"`);
    
    // If account field is still empty, the selection failed
    if (!accountInputValue || accountInputValue.trim() === '') {
      console.log(`❌ Account field is empty after selection attempt`);
      throw new Error(`❌ Account selection failed - field is empty`);
    }
    
    // Wait for form to update after account selection
    await this.page.waitForTimeout(1200);
    
    // Fill email if field is visible (optional field)
    const emailVisible = await this.emailInput.isVisible().catch(() => false);
    if (emailVisible) {
      await this.emailInput.fill(uniqueEmail);
      console.log(`📧 Email added: ${uniqueEmail}`);
    } else {
      console.log(`ℹ️  Email field not visible, skipping`);
    }

    // Save the contact - enhanced with more strategies for changing locators
    const saved = await this.clickSaveButton();
    if (!saved) {
      throw new Error('❌ Unable to click Save button');
    }

    // Wait for save to process and check for errors
    await this.page.waitForTimeout(3000);
    
    // Check for validation errors
    const errorMessages = await this.page.locator('.slds-form-element__help, .slds-theme_error, [data-aura-class="forceFormValidationError"]')
      .allTextContents()
      .catch(() => []);
    
    if (errorMessages.length > 0 && errorMessages.some(msg => msg.trim())) {
      const errors = errorMessages.filter(msg => msg.trim()).join(', ');
      console.error(`❌ Validation errors found: ${errors}`);
      throw new Error(`❌ Contact creation failed with validation errors: ${errors}`);
    }

    // Check if we're still on the "new" page
    const currentUrl = this.page.url();
    if (currentUrl.includes('/new')) {
      console.log(`⚠️  Still on "new" page, checking for hidden errors...`);
      // Take a screenshot for debugging
      await this.page.screenshot({ path: `contact-error-${Date.now()}.png` });
      throw new Error(`❌ Contact was not saved. Still on the "new" page. URL: ${currentUrl}`);
    }

    // Wait for navigation to contact record page
    try {
      // Match both URL formats: /r/Contact/ID/view OR /r/ID/view
      await this.page.waitForURL(/\/r\/(Contact\/)?003.*\/view/, { timeout: 15000 });
      console.log(`✅ Navigated to contact record page`);
    } catch (error) {
      const finalUrl = this.page.url();
      console.log(`⚠️  Navigation timeout, checking current URL: ${finalUrl}`);
    }

    // Extract and return the contact ID
    const contactId = await extractSalesforceId(this.page, 'Contact', 10000);

    if (!contactId) {
      throw new Error('❌ Unable to extract Contact ID from URL');
    }

    console.log(`✅ Created Contact: ${firstName} ${uniqueLastName} | ID: ${contactId}`);
   
    return contactId;
  }

  /**
   * Select account from dropdown with multiple fallback strategies
   * IMPORTANT: Avoids "Show more results for..." option that also contains the account name
   */
  private async selectAccountFromDropdown(accountName: string): Promise<boolean> {
    const strategies = [
      // Strategy 1: Click lightning-base-combobox-item that is NOT "Show more results"
      async () => {
        // Get all options with the account name
        const options = this.page.locator('lightning-base-combobox-item').filter({ hasText: accountName });
        const count = await options.count();
        
        // Check each option and skip the "Show more" one
        for (let i = 0; i < count; i++) {
          const optionText = await options.nth(i).textContent();
          if (optionText && !optionText.includes('Show more')) {
            await options.nth(i).click({ timeout: 3000 });
            return true;
          }
        }
        throw new Error('No valid option found');
      },
      
      // Strategy 2: Click by title attribute (exact match) - most reliable
      async () => {
        await this.page.locator(`lightning-base-combobox-item[title="${accountName}"]`).click({ timeout: 3000 });
        return true;
      },
      
      // Strategy 3: Filter to exclude "Show more" text
      async () => {
        await this.page.locator('lightning-base-combobox-item')
          .filter({ hasText: accountName })
          .filter({ hasNotText: 'Show more' })
          .first()
          .click({ timeout: 3000 });
        return true;
      }
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        await strategies[i]();
        console.log(`✅ Account selected using strategy ${i + 1}`);
        return true;
      } catch (error) {
        console.log(`⚠️  Strategy ${i + 1} failed, trying next...`);
      }
    }

    return false;
  }

  /**
   * Click Save button with multiple fallback strategies for changing locators
   */
  private async clickSaveButton(): Promise<boolean> {
    const strategies = [
      // Strategy 1: Click by name attribute (most reliable)
      async () => {
        await this.page.locator('button[name="SaveEdit"]').click({ timeout: 5000 });
        return true;
      },
      
      // Strategy 2: Click footer Save button
      async () => {
        await this.page.locator('.slds-modal__footer button:has-text("Save")').first().click({ timeout: 5000 });
        return true;
      },
      
      // Strategy 3: Click by role with "Save" name
      async () => {
        await this.page.getByRole('button', { name: 'Save' }).first().click({ timeout: 5000 });
        return true;
      },
      
      // Strategy 4: Click by title attribute
      async () => {
        await this.page.locator('button[title="Save"]').click({ timeout: 5000 });
        return true;
      },
      
      // Strategy 5: Click any visible Save button in form
      async () => {
        await this.page.locator('form button:has-text("Save")').first().click({ timeout: 5000 });
        return true;
      },
      
      // Strategy 6: Click button with exact text "Save"
      async () => {
        await this.page.getByText('Save', { exact: true }).first().click({ timeout: 5000 });
        return true;
      },
      
      // Strategy 7: Click using class and text combination
      async () => {
        await this.page.locator('.slds-button.slds-button_brand:has-text("Save")').first().click({ timeout: 5000 });
        return true;
      },
      
      // Strategy 8: Force click on any Save button
      async () => {
        await this.page.locator('button:has-text("Save")').first().click({ force: true, timeout: 5000 });
        return true;
      }
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        await strategies[i]();
        console.log(`✅ Save button clicked using strategy ${i + 1}`);
        return true;
      } catch (error) {
        console.log(`⚠️  Save strategy ${i + 1} failed, trying next...`);
      }
    }

    return false;
  }
}
