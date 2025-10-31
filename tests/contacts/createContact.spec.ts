import { test, expect } from '../../fixtures';
import { AccountPage } from '../../pages/AccountPage';
import { ContactPage } from '../../pages/ContactPage';
import accountData from '../../data/accountData.json';
import contactData from '../../data/contactData.json';

test.describe('Salesforce Contact Tests', () => {

  test('Create Contact under a new Account', async ({ loginPage, page }, testInfo) => {
    test.setTimeout(60000); // 60 seconds timeout for contact creation
    console.log(`\n🔢 ========== Test Iteration: ${testInfo.repeatEachIndex + 1} ==========`);
    const accountPage = new AccountPage(page);
    const contactPage = new ContactPage(page);

    // Step 1: Create a new Account (pre-requisite)
    const { name, type } = accountData.singleAccount;
    const { accountName, accountId } = await accountPage.createAccount(name, type);
   
    // Step 2: Create Contact under that Account
    const { firstName, lastName } = contactData.singleContact;

    const contactId = await contactPage.createContact(firstName, lastName, accountName);

    // Verify contact was created
    expect(contactId).toBeTruthy();
    expect(contactId).toMatch(/^003/); // Salesforce Contact IDs start with 003
    
    // Verify we're on the contact detail page (supports both URL formats)
    const currentUrl = page.url();
    expect(
      currentUrl.includes(`/lightning/r/Contact/${contactId}/view`) || 
      currentUrl.includes(`/lightning/r/${contactId}/view`)
    ).toBeTruthy();
    
    console.log(`✅ Test completed: Contact ${contactId} created under Account ${accountId}`);
  });

  test.describe('Multiple Contacts under same Account', () => {
    let accountName: string;
    let accountId: string;
    
    // Demonstrates beforeEach - runs before EACH test in this describe block
    test.beforeEach(async ({ loginPage, page }) => {
      test.setTimeout(60000); // 60 seconds timeout
      const accountPage = new AccountPage(page);
      const { name, type } = accountData.singleAccount;
      ({ accountName, accountId } = await accountPage.createAccount(name, type));
      console.log(`📋 Setup (beforeEach): Created Account ${accountName} (${accountId})`);
    });

    test('Create primary contact', async ({ page }, testInfo) => {
      test.setTimeout(60000); // 60 seconds timeout
      console.log(`\n🔢 ========== Test Iteration: ${testInfo.repeatEachIndex + 1} ==========`);
      const contactPage = new ContactPage(page);
      const { firstName, lastName } = contactData.singleContact;

      const contactId = await contactPage.createContact(firstName, lastName, accountName);
      
      expect(contactId).toBeTruthy();
      expect(contactId).toMatch(/^003/);
      console.log(`✅ Primary contact created: ${contactId}`);
    });

    test('Create secondary contact with different name', async ({ page }, testInfo) => {
      test.setTimeout(60000); // 60 seconds timeout
      console.log(`\n🔢 ========== Test Iteration: ${testInfo.repeatEachIndex + 1} ==========`);
      const contactPage = new ContactPage(page);
      
      // Use secondary contact data
      const { firstName, lastName } = contactData.secondaryContact;

      const contactId = await contactPage.createContact(firstName, lastName, accountName);
      
      expect(contactId).toBeTruthy();
      expect(contactId).toMatch(/^003/);
      console.log(`✅ Secondary contact created: ${contactId}`);
    });

  });

});

