import { expect, test } from '@playwright/test';

const TRAFFIC_HIERARCHY_RESOURCE_PATH = '/ui#/traffic-configuration';
const TRAFFIC_CONFIGURATION = 'Traffic Configuration';
const DEFAULT_FORM_TEXT = 'Choose a bind, listener, route, backend, or policy from the hierarchy tree on the left to view and edit its configuration.';
const HEADER_SUBTEXT = 'View and edit the full agentgateway configuration.';

test.beforeEach(async ({page}) => { 
    // navigate to Traffic Hierarchy page
    await page.goto(TRAFFIC_HIERARCHY_RESOURCE_PATH);
});

test('should verify Traffic Hierarchy page contents are visible', async ({ page }) => { 
    // verify banner
    const banner = page.getByRole('banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(TRAFFIC_CONFIGURATION);

    // verify page heading
    const heading = page.locator('h1').filter({ hasText: TRAFFIC_CONFIGURATION });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(TRAFFIC_CONFIGURATION);

    // verify subtext
    const subtext = page.getByText(HEADER_SUBTEXT);
    await expect(subtext).toBeVisible();
    await expect(subtext).toHaveText(HEADER_SUBTEXT);

    // verify traffic hierarchy form
    const trafficHierarchyForm = page.locator('.ant-card').filter({ hasText: TRAFFIC_CONFIGURATION });
    await expect(trafficHierarchyForm).toBeVisible();
    await expect(trafficHierarchyForm).toContainText(TRAFFIC_CONFIGURATION);
    
    const addButton = trafficHierarchyForm.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveText('Add');

    // verify default form text
    const defaultFormText = page.getByText(DEFAULT_FORM_TEXT);
    await expect(defaultFormText).toBeVisible();
    await expect(defaultFormText).toHaveText(DEFAULT_FORM_TEXT);
});