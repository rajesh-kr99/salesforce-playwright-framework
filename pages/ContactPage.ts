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
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;

    //Locators
    this.newButton = page.getByRole('button', { name: 'New' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.accountLookupInput = page.getByRole('combobox', { name: 'Account Name' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
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

    const uniquelastName = await this.createUniqueLastName(lastName); 
    const uniqueEmail = await this.createUniqueEmail(firstName, lastName);

    await this.newButton.click();
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(uniquelastName);
    await this.accountLookupInput.dblclick();
    await this.page.getByText(accountName).isVisible();
    await this.page.getByText(accountName).click();
    await this.emailInput.fill(uniqueEmail);  
  

  

    await this.saveButton.click();

    //Verify Success
    await expect(this.page.getByText('was created')).toBeVisible({ timeout: 10000 });

    console.log(`✅ Contact created: ${firstName} ${lastName}`);
// Wait for navigation and capture the new record URL

  await waitForRecordUrl(this.page, 10000);

  // ✅ Extract and return the record ID
  const contactId = await extractSalesforceId(this.page, 'Contact', 10000);

  if (!contactId) {
    throw new Error('❌ Unable to extract Contact ID from URL');
  }
   
    return contactId;
  }
}
