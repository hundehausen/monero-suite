import { test, expect } from "@playwright/test";

test.describe("advanced config desktop layout", () => {
  test("wide desktop keeps compose visible without a dialog", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await expect(page.getByRole("separator")).toHaveCount(1);

    await page
      .getByRole("button", { name: "Advanced Configuration", exact: true })
      .click();

    await expect(
      page.getByText("Advanced Monero Node Configuration")
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: "Close Advanced Configuration",
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Download docker-compose.yml" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "CPU Architecture" })
    ).toBeVisible();
    await expect(page.getByRole("separator")).toHaveCount(2);

    await page
      .getByRole("button", {
        name: "Close Advanced Configuration",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Advanced Monero Node Configuration")
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Advanced Configuration", exact: true })
    ).toBeVisible();
  });

  test("wide desktop closes Advanced on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await page.getByRole("button", { name: "Advanced Configuration" }).click();
    await expect(
      page.getByText("Advanced Monero Node Configuration")
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
      page.getByText("Advanced Monero Node Configuration")
    ).toHaveCount(0);
  });

  test("medium desktop replaces the form and keeps compose", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 720 });
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "CPU Architecture" })
    ).toBeVisible();
    await expect(page.getByRole("separator")).toHaveCount(1);

    await page.getByRole("button", { name: "Advanced Configuration" }).click();

    await expect(
      page.getByText("Advanced Monero Node Configuration")
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("separator")).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: "CPU Architecture" })
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Download docker-compose.yml" })
    ).toBeVisible();
  });

  test("phone still opens Advanced as a dialog", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("separator")).toHaveCount(0);

    await page.getByRole("button", { name: "Configure services" }).click();
    await page.getByRole("button", { name: "Advanced Configuration" }).click();

    const dialog = page.getByRole("dialog").filter({
      hasText: "Advanced Monero Node Configuration",
    });
    await expect(dialog).toBeVisible();
  });
});
