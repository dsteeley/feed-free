/**
 * E2E tests for YouTube CSS hiding rules.
 * Uses the generated CSS from buildYtCss().
 */
import { test, expect } from '@playwright/test';
import { buildYtCss } from '../../lib/selectors/youtube';

const FIXTURE_URL = 'http://localhost:9999/youtube.html';

test.describe('YouTube — built CSS artifact against fixture', () => {
  test('hides feed grid when active class set', async ({ page }) => {
    const css = buildYtCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      document.documentElement.classList.add('feedfree-yt-active');
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#feed-grid')).not.toBeVisible();
    await expect(page.locator('#feed-item-1')).not.toBeVisible();
  });

  test('hides watch sidebar when active class set', async ({ page }) => {
    const css = buildYtCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      document.documentElement.classList.add('feedfree-yt-active');
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#secondary')).not.toBeVisible();
  });

  test('hides shorts shelf when active class set', async ({ page }) => {
    const css = buildYtCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      document.documentElement.classList.add('feedfree-yt-active');
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#shorts-shelf')).not.toBeVisible();
  });

  test('hides nothing without the active class', async ({ page }) => {
    const css = buildYtCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#feed-grid')).toBeVisible();
    await expect(page.locator('#secondary')).toBeVisible();
    await expect(page.locator('#shorts-shelf')).toBeVisible();
  });

  test('fixture contains all expected DOM elements', async ({ page }) => {
    await page.goto(FIXTURE_URL);
    await expect(page.locator('ytd-rich-grid-renderer')).toBeAttached();
    await expect(page.locator('#secondary')).toBeAttached();
    await expect(page.locator('ytd-reel-shelf-renderer')).toBeAttached();
    await expect(page.locator('ytd-compact-autoplay-renderer')).toBeAttached();
    await expect(page.locator('.ytp-endscreen-content')).toBeAttached();
  });
});
