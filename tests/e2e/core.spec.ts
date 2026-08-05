import { expect, test } from "@playwright/test";

test("timeline defaults to a horizontal lineage map", async ({ page }) => {
  await page.goto("/timeline/");
  await expect(page.locator(".lineageViewport")).toBeVisible();
  await expect(page.locator(".timelineNode").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Lineage map" })).toHaveAttribute("aria-pressed", "true");
});

test("timeline keeps filters and selection in a shareable URL", async ({ page }) => {
  await page.goto("/timeline/");
  await page.locator(".timelineSelect select").first().selectOption("openai");
  await expect(page).toHaveURL(/org=openai/);
  await page.locator(".timelineNode").first().click();
  await expect(page).toHaveURL(/selected=/);
  await expect(page.locator(".nodeSummary")).toBeVisible();
});

test("timeline switches to the same filtered list", async ({ page }) => {
  await page.goto("/timeline/?track=model_release");
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page).toHaveURL(/view=list/);
  await expect(page.locator(".timelineList article")).toHaveCount(21);
});

test("timeline exposes a detail page from list selection", async ({ page }) => {
  await page.goto("/timeline/?view=list");
  await page.locator(".timelineList a").first().click();
  await expect(page).toHaveURL(/timeline\/.+\//);
});

test("timeline works on mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto("/timeline/");
  await expect(page.locator(".lineageViewport")).toBeVisible();
  await expect(page.locator(".timelineToolbar")).toBeVisible();
});

test("static timeline provides links without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/timeline/");
  await expect(page.locator(".noscriptTimeline")).toBeVisible();
  await expect(page.getByRole("link", { name: /Transformer/ }).first()).toBeVisible();
  await context.close();
});