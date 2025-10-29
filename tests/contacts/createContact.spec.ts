import { test, expect } from '../../fixtures';
import { AccountPage } from '../../pages/AccountPage';
import { ContactPage } from '../../pages/ContactPage';
import accountData from '../../data/accountData.json';
import contactData from '../../data/contactData.json';

test('Create Contact under a new Account', async ({ loginPage, page }) => {
  
  const accountPage = new AccountPage(page);
  const contactPage = new ContactPage(page);

  // Step 1: Create a new Account (pre-requisite)
  
  const { name, type } = accountData.singleAccount;
  const { accountName, accountId } = await accountPage.createAccount(name, type);
 
  // Step 2: Create Contact under that Account
  
  const { firstName, lastName} = contactData.singleContact;
  const randomSuffix = Math.floor(Math.random() * 10000); // random 4-digit number
  const uniqueLastName = `${lastName}_${randomSuffix}`;
  const uniqueEmail = `${firstName}.${uniqueLastName}@example.com`;

  const contactFullName = await contactPage.createContact(
    firstName,
    uniqueLastName,
    accountName
  );

});

test.describe('Contact tests of each record type', () => {
  let accountName: string;
  let accountId: string;
  
  test.beforeEach(async ({ loginPage, page }) => {
    const accountPage = new AccountPage(page);
    const { name, type } = accountData.singleAccount;
    ({ accountName, accountId } = await accountPage.createAccount(name, type));
  });

  test('Create first contact', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const { firstName, lastName} = contactData.singleContact;


  const contactId = await contactPage.createContact(firstName, lastName, accountName );
    
  });

  test('Create second contact', async ({ page }) => {
  const contactPage = new ContactPage(page);
  const { firstName, lastName} = contactData.singleContact;

  const contactId = await contactPage.createContact(firstName, lastName, accountName );

  });

});

