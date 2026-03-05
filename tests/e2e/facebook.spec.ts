/**
 * E2E tests for Facebook content script.
 *
 * Serves fixture HTML via local HTTP server, then injects the generated CSS
 * from buildFbCss() into a real browser page (Playwright Firefox) and asserts
 * element visibility.
 *
 * This validates the complete pipeline:
 *   selector constants → buildFbCss() → hides real DOM structure
 */
import { test, expect } from '@playwright/test';
import { buildFbCss } from '../../lib/selectors/facebook';

const FIXTURE_URL = 'http://localhost:9999/facebook.html';

test.describe('Facebook — built CSS artifact against fixture', () => {
  test('hides feed items on home page', async ({ page }) => {
    const css = buildFbCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      document.documentElement.classList.add('fbfocus-hide-feed');
      document.documentElement.setAttribute('data-fbfocus-page', 'home');
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#feed-unit-0')).not.toBeVisible();
    await expect(page.locator('#feed-unit-1')).not.toBeVisible();
  });

  test('does not hide feed on groups page', async ({ page }) => {
    const css = buildFbCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      document.documentElement.classList.add('fbfocus-hide-feed');
      document.documentElement.setAttribute('data-fbfocus-page', 'groups');
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#feed-unit-0')).toBeVisible();
  });

  test('hides stories bar on home page', async ({ page }) => {
    const css = buildFbCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      document.documentElement.classList.add('fbfocus-hide-feed');
      document.documentElement.setAttribute('data-fbfocus-page', 'home');
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#stories')).not.toBeVisible();
  });

  test('hides right sidebar', async ({ page }) => {
    const css = buildFbCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      document.documentElement.classList.add('fbfocus-hide-feed');
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#right-rail')).not.toBeVisible();
  });

  test('hides reel articles when reels class set', async ({ page }) => {
    const css = buildFbCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      document.documentElement.classList.add('fbfocus-hide-reels');
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#reel-post')).not.toBeVisible();
  });

  test('removing class restores visibility', async ({ page }) => {
    const css = buildFbCss();
    await page.goto(FIXTURE_URL);
    await page.evaluate((cssText) => {
      document.documentElement.classList.add('fbfocus-hide-feed');
      document.documentElement.setAttribute('data-fbfocus-page', 'home');
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
    }, css);

    await expect(page.locator('#feed-unit-0')).not.toBeVisible();

    await page.evaluate(() => {
      document.documentElement.classList.remove('fbfocus-hide-feed');
    });

    await expect(page.locator('#feed-unit-0')).toBeVisible();
  });

  test('fixture contains all expected DOM elements', async ({ page }) => {
    await page.goto(FIXTURE_URL);
    await expect(page.locator('[data-pagelet="FeedUnit_0"]')).toBeAttached();
    await expect(page.locator('[data-pagelet="Stories"]')).toBeAttached();
    await expect(page.locator('[data-pagelet="RightRail"]')).toBeAttached();
    await expect(page.locator('[data-fbfocus-reel="true"]')).toBeAttached();
  });
});
