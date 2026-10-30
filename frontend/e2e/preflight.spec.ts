import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

/** Capture text-based UI evidence for desktop and mobile checklist states. */
test('capture accessibility, computed styles, and rendered HTML preflight', async ({ page }) => {
  const evidence: string[] = [];
  const viewports = [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    evidence.push(`## ${viewport.name} empty state`);
    evidence.push(`Accessibility tree: ${JSON.stringify(await page.locator('body').ariaSnapshot())}`);
    evidence.push(`Computed styles: ${JSON.stringify(await page.evaluate(() => ({
      bodyFont: getComputedStyle(document.body).fontFamily,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      headingFont: getComputedStyle(document.querySelector('h1')!).fontFamily,
      cardWidth: getComputedStyle(document.querySelector('.todo-card')!).width,
    })))}`);
    evidence.push(`Rendered HTML: ${await page.content()}`);
    await page.screenshot({ path: `test-results/preflight-${viewport.name}-empty.png`, fullPage: true });

    await page.getByTestId('todo-input').fill('A representative task');
    await page.getByTestId('add-button').click();
    await expect(page.getByTestId('todo-title-1')).toHaveText('A representative task');
    evidence.push(`## ${viewport.name} populated state`);
    evidence.push(`Accessibility tree: ${JSON.stringify(await page.locator('body').ariaSnapshot())}`);
    evidence.push(`Computed styles: ${JSON.stringify(await page.evaluate(() => ({
      bodyFont: getComputedStyle(document.body).fontFamily,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      headingFont: getComputedStyle(document.querySelector('h1')!).fontFamily,
      taskTextDecoration: getComputedStyle(document.querySelector('[data-testid="todo-title-1"]')!).textDecorationLine,
    })))}`);
    evidence.push(`Rendered HTML: ${await page.content()}`);
    await page.screenshot({ path: `test-results/preflight-${viewport.name}-populated.png`, fullPage: true });
  }

  await writeFile('test-results/ui-preflight.txt', evidence.join('\n\n'), 'utf8');
});
