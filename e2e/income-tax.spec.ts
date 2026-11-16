import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  // The application uses localhost:8000. Forward only this feature's request
  // to the real isolated API rather than requiring a personal server to stop.
  await page.route('http://localhost:8000/income-tax/assets?**', async route => {
    const response = await route.fetch({
      url: route.request().url().replace('http://localhost:8000', 'http://127.0.0.1:18000'),
    });
    await route.fulfill({ response });
  });
});

test('navigates, shows historical/closed/foreign assets, copies and exports filtered rows', async ({ page }, testInfo) => {
  await page.goto('/dashboard');
  await page.getByRole('link', { name: 'Imposto de renda' }).click();
  await expect(page).toHaveURL(/\/income-tax$/);
  await expect(page.locator('#income-tax-year option:checked')).toHaveText('2025 · exercício 2026');

  await page.locator('#income-tax-search').fill('IRTEST3');
  const detail = page.getByTestId('asset-detail');
  await expect(detail).toContainText('IRTEST3');
  await expect(detail).toContainText('Posição encerrada');
  await expect(detail).toContainText('31/12/2024');
  await expect(detail).toContainText('31/12/2025');
  // 10 × stored 12.345 must round only the final acquisition cost.
  await expect(detail).toContainText('123,45');
  await page.screenshot({ path: testInfo.outputPath('income-tax.png'), fullPage: true });
  await page.getByRole('button', { name: 'Copiar discriminação', exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('IRTEST3');
  await detail.screenshot({ path: testInfo.outputPath('income-tax-detail.png') });
  await page.getByRole('button', { name: 'Copiar linha', exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('31/12/2024');

  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV', exact: true }).click();
  const download = await downloading;
  const csv = await readFile((await download.path())!);
  expect([...csv.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  const text = csv.toString('utf8');
  expect(text).toContain('IRTEST3');
  expect(text).toContain('123,45');
  expect(text).not.toContain('FOREIGN');

  await page.locator('#income-tax-search').fill('FOREIGN');
  await expect(detail).toContainText('USD');
  await expect(detail).toContainText('Conversão fiscal pendente');
  await expect(detail).toContainText('Não se aplica');
  await expect(detail).toContainText('25,16');

  await page.locator('#income-tax-year').selectOption({ label: '2026 · exercício 2027' });
  await page.locator('#income-tax-search').fill('NOVO3');
  await expect(detail).toContainText('NOVO3');
  await expect(page.getByText('16/11/2026', { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/Prévia/).first()).toBeVisible();
  await expect(detail).toContainText('Sem posição registrada nessa data');
});

test('explains a failed request and retries successfully', async ({ page }) => {
  let failed = false;
  await page.route('http://localhost:8000/income-tax/assets?**', async route => {
    if (!failed) {
      failed = true;
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"Indisponível"}' });
      return;
    }
    const response = await route.fetch({
      url: route.request().url().replace('http://localhost:8000', 'http://127.0.0.1:18000'),
    });
    await route.fulfill({ response });
  });
  await page.goto('/income-tax');
  await page.getByRole('button', { name: /Tentar novamente|Repetir/ }).click();
  await page.locator('#income-tax-search').fill('IRTEST3');
  await expect(page.getByTestId('asset-detail')).toContainText('IRTEST3');
});

test('keeps export and copy buttons readable when switching dark and light themes', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('app-theme-preference', 'dark'));
  await page.goto('/income-tax');
  await page.locator('#income-tax-search').fill('IRTEST3');
  await expect(page.getByTestId('asset-detail')).toContainText('IRTEST3');

  for (const theme of ['dark', 'light']) {
    await expect(page.locator('body')).toHaveClass(new RegExp(`${theme}-theme`));
    await expect(page.locator('body')).toHaveCSS('background-color',
      theme === 'dark' ? 'rgb(18, 21, 26)' : 'rgb(248, 250, 252)');
    const contrast = await page.locator('.income-tax-page button:enabled').evaluateAll(buttons => {
      const rgb = (color: string) => (color.match(/[\d.]+/g) ?? []).map(Number);
      const luminance = (color: string) => rgb(color).slice(0, 3).map(value => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      return buttons.map(button => {
        let background: Element | null = button;
        while (background && (rgb(getComputedStyle(background).backgroundColor)[3] ?? 1) === 0) {
          background = background.parentElement;
        }
        const foregroundLuminance = luminance(getComputedStyle(button).color);
        const backgroundLuminance = luminance(background ? getComputedStyle(background).backgroundColor : 'rgb(255, 255, 255)');
        return {
          name: button.getAttribute('aria-label') ?? button.textContent?.trim(),
          ratio: (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
            (Math.min(foregroundLuminance, backgroundLuminance) + 0.05),
        };
      });
    });
    expect(contrast.length).toBeGreaterThan(5);
    for (const button of contrast) {
      expect(button.ratio, `${theme}: ${button.name}`).toBeGreaterThanOrEqual(4.5);
    }
    await page.getByRole('button', { name: 'Exportar CSV', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`buttons-${theme}.png`) });
    await page.getByTestId('asset-detail').screenshot({ path: testInfo.outputPath(`copy-buttons-${theme}.png`) });
    if (theme === 'dark') await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
  }
});
