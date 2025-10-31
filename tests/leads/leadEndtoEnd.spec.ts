import { test, expect } from '../../fixtures';
import { LeadPage } from '../../pages/LeadPage';
import leadData from '../../data/leadData.json';



test.describe('Salesforce Lead End-to-End Lifecycle', () => {
  let leadPage: LeadPage;
  let leadId: string;
  let leadName: string;

  test('Create Lead → Move through statuses → Convert', async ({ loginPage, page }) => {
    test.setTimeout(60000); // Increase timeout to 60 seconds for full E2E flow
    leadPage = new LeadPage(page);
    const data = leadData.E2ELead;

    const result = await leadPage.createLead(data);
    leadId = result.leadId;
    leadName = result.leadName;

    await leadPage.moveThroughStatuses(leadId, data.targetStatuses);
    await leadPage.convertLead(leadId);

    console.log(`🎯 E2E Lead Lifecycle completed for: ${leadName}`);
  });
});
