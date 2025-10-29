import { test, expect } from '../../fixtures';
import { LeadPage } from '../../pages/LeadPage';
import leadData from '../../data/leadData.json';

test('Create and Convert Salesforce Lead', async ({ loginPage, page }) => {
  const leadPage = new LeadPage(page);
  const data = leadData.ConvertLead;

  const { leadId } = await leadPage.createLead(data);
  await leadPage.convertLead(leadId);
});
