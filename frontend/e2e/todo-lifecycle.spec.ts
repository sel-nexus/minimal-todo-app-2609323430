import { expect, test } from '@playwright/test';

test('complete task lifecycle preserves the deterministic browser contract', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      browserErrors.push(`console ${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => browserErrors.push(`page error: ${error.message}`));

  await page.goto('/');
  await expect(page).toHaveTitle('Todo App');
  await expect(page.getByRole('heading', { level: 1, name: 'Todo App' })).toBeVisible();
  await expect(page.getByTestId('empty-state')).toHaveText('No tasks yet.');
  await expect(page.getByTestId('todo-list')).toBeEmpty();

  const input = page.getByTestId('todo-input');
  await input.fill('  Buy milk  ');
  await page.getByTestId('add-button').click();
  await expect(page.getByTestId('todo-title-1')).toHaveText('Buy milk');
  await expect(page.getByTestId('todo-checkbox-1')).not.toBeChecked();
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('empty-state')).toBeHidden();

  await input.fill('Read a chapter');
  await input.press('Enter');
  await expect(page.getByTestId('todo-title-2')).toHaveText('Read a chapter');

  await input.fill('   ');
  await page.getByTestId('add-button').click();
  await expect(input).toHaveValue('   ');
  await expect(page.getByTestId('todo-list').locator('li')).toHaveCount(2);
  await input.press('Enter');
  await expect(page.getByTestId('todo-list').locator('li')).toHaveCount(2);

  await input.fill('Water plants');
  await page.getByTestId('add-button').click();
  await expect(page.getByTestId('todo-title-3')).toHaveText('Water plants');
  await expect(page.getByTestId('todo-list').locator('li')).toHaveText([
    'Buy milkDelete',
    'Read a chapterDelete',
    'Water plantsDelete',
  ]);

  await page.getByTestId('todo-checkbox-2').check();
  await expect(page.getByTestId('todo-checkbox-2')).toBeChecked();
  await expect(page.getByTestId('todo-title-2')).toHaveCSS('text-decoration-line', 'line-through');
  await expect(page.getByTestId('todo-checkbox-1')).not.toBeChecked();
  await page.getByTestId('todo-checkbox-2').uncheck();
  await expect(page.getByTestId('todo-title-2')).not.toHaveCSS('text-decoration-line', 'line-through');

  await page.getByTestId('todo-delete-2').click();
  await expect(page.getByTestId('todo-item-2')).toHaveCount(0);
  await expect(page.getByTestId('todo-list').locator('li')).toHaveText([
    'Buy milkDelete',
    'Water plantsDelete',
  ]);

  await input.fill('<img src=x onerror=alert(1)>');
  await page.getByTestId('add-button').click();
  await expect(page.getByTestId('todo-title-4')).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('[data-testid="todo-title-4"] img')).toHaveCount(0);

  await page.getByTestId('todo-delete-1').click();
  await page.getByTestId('todo-delete-3').click();
  await page.getByTestId('todo-delete-4').click();
  await expect(page.getByTestId('todo-list')).toBeEmpty();
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('empty-state')).toHaveText('No tasks yet.');

  await input.fill('Reload is transient');
  await page.getByTestId('add-button').click();
  await page.reload();
  await expect(page.getByTestId('todo-list')).toBeEmpty();
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await input.fill('New session');
  await page.getByTestId('add-button').click();
  await expect(page.getByTestId('todo-item-1')).toBeVisible();

  expect(browserErrors).toEqual([]);
});
