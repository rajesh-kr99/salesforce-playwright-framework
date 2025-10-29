import { test, expect } from '../../fixtures';
import { AccountPage } from '../../pages/AccountPage';
import { OpportunityPage } from '../../pages/OpportunityPage';
import accountData from '../../data/accountData.json';
import opportunityData from '../../data/opportunitydata.json';

test('Create Salesforce Opportunity under a new account', async ({ loginPage, page }) => {
  const accountPage = new AccountPage(page);
  const opportunityPage = new OpportunityPage(page);

  // Step 1: Create a new Account (pre-requisite)
  const { name, type } = accountData.singleAccount;
  const { accountName, accountId } = await accountPage.createAccount(name, type);

  // Step 2: Create a new Opportunity under that account
 
const opportunity = opportunityData.Opportunity;
const { opportunityName, opportunityId } = await opportunityPage.createOpportunity({
  name: opportunity.name,
  closeDate: opportunity.closeDate,
  stage: opportunity.stage,
  accountName
});
console.log(`✅ Created Opportunity: ${opportunityName} (ID: ${opportunityId})`);

});


