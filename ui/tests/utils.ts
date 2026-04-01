import { expect, type Page } from "@playwright/test";

export const verifyLogPageContents = async (page: Page, title: string) => { 
    // verify banner
    const banner = page.getByRole('banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(title);

    // verify log search input
    const logSearchInput = page.getByTestId('log-viewer-search');
    await expect(logSearchInput).toBeVisible();

    // verify Wrap Text checkbox
    const wrapTextCheckbox = page.getByTestId('wrap-text-checkbox');
    await expect(wrapTextCheckbox).toBeVisible();
    await expect(wrapTextCheckbox).toBeChecked({ checked: false});

    // verify Log Viewer
    const logViewer = page.getByTestId('log-viewer');
    await expect(logViewer).toBeVisible();

    // verify Control Logs button
    const logControlButton = page.getByTestId('log-viewer-control-button');
    await expect(logControlButton).toBeVisible();
    await expect(logControlButton).toHaveText('Pause Logs');

    // click Control Logs button
    await logControlButton.click();
    await expect(logControlButton).toHaveText('Resume Logs');

    // verify Footer button
    const footerButton = page.getByTestId('log-viewer-footer-button');
    await expect(footerButton).toBeVisible();
    await expect(footerButton).toHaveText('Resume Logs');

    // click Control Logs button
    await footerButton.click();
    await expect(footerButton).not.toBeVisible();
};