import { expect, test } from '@playwright/test';

const TRAFFIC_HIERARCHY_RESOURCE_PATH = '/ui#/traffic';

test.beforeEach(async ({page}) => { 
    // navigate to Traffic Hierarchy page
    await page.goto(TRAFFIC_HIERARCHY_RESOURCE_PATH);
});

test('should verify Traffic Hierarchy page contents are visible', async ({ page }) => { 
    // verify banner
    const banner = page.getByRole('banner');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveText('Traffic');

    // verify page heading
    const heading = page.getByRole('heading', { name: 'Traffic Configuration (Manual Schemas)' });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Traffic Configuration (Manual Schemas)');

    // verify subtext
    const subtext = page.getByText('Manage your gateway routing with manually configured TypeScript schemas');
    await expect(subtext).toBeVisible();
    await expect(subtext).toHaveText('Manage your gateway routing with manually configured TypeScript schemas');

    // verify info dialog box
    const infoDialogBox = page.locator('.ant-alert-info');
    await expect(infoDialogBox).toBeVisible();
    await expect(infoDialogBox).toContainText('Manual TypeScript Schemas');
    await expect(infoDialogBox).toContainText('This page uses manually configured TypeScript form schemas (not auto-generated JSON). Forms are defined in traffic/forms/ and use config.d.ts types directly for compile-time safety.');

    // close info dialog box
    const infoDialogBoxCloseButton = infoDialogBox.locator('.ant-alert-close-icon');
    await infoDialogBoxCloseButton.click();
    await expect(infoDialogBox).not.toBeVisible();

    // verify traffic hierarchy form
    const trafficHierarchyForm = page.locator('.ant-card').filter({ hasText: 'Traffic Hierarchy' });
    await expect(trafficHierarchyForm).toBeVisible();
    await expect(trafficHierarchyForm).toContainText('Traffic Hierarchy');
    
    const addButton = trafficHierarchyForm.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveText('Add');
});