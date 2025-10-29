import { test, expect } from '../../fixtures';
import { LeadPage } from '../../pages/LeadPage';
import leadData from '../../data/leadData.json';

test('Validate Salesforce Lead Status', async ({ loginPage, page }) => {
  const leadPage = new LeadPage(page);
  const data = leadData.LeadValidation;

  const { leadId } = await leadPage.createLead(data);
  await leadPage.validateLead(leadId, data.status);
});
