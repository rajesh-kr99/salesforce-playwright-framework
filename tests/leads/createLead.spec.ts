import { test, expect } from '../../fixtures';
import { LeadPage } from '../../pages/LeadPage';
import leadData from '../../data/leadData.json';

test('Create Salesforce Lead', async ({ loginPage, page }) => {
  const leadPage = new LeadPage(page);
  const data = leadData.Lead;

  const { leadId, leadName } = await leadPage.createLead(data);
  console.log(`✅ Created Lead: ${leadName}, ID: ${leadId}`);
});
