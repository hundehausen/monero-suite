import { test, expect } from "@playwright/test";

test.describe("appshell mobile consume layout", () => {
  test("phone shows compose first and keeps the form in a drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Download docker-compose.yml" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "CPU Architecture" })
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Configure services" }).click();
    const services = page.getByRole("dialog", { name: "Configure services" });
    await expect(services).toBeVisible();
    await expect(
      page.getByRole("button", { name: "CPU Architecture" })
    ).toBeVisible();

    await services.getByRole("button", { name: "Close" }).click();
    await expect(services).toBeHidden();

    await page.getByRole("button", { name: "Links" }).click();
    await expect(page.getByRole("menuitem", { name: "GitHub" })).toBeVisible();
  });

  test("desktop keeps the two-column playground and has no burger", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Configure services" })
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "CPU Architecture" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Download docker-compose.yml" })
    ).toBeVisible();
  });
});
