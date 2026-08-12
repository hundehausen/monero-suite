import { test, expect, type Page } from "@playwright/test";

const MONITORING_IMAGES = [
  "grafana/grafana:latest",
  "prom/prometheus:latest",
  "lalanza808/exporter:1.0.0",
  "lalanza808/nodemapper:1.0.4",
];

async function composeYaml(page: Page): Promise<string> {
  await page.getByRole("tab", { name: /Docker Compose/i }).click();
  return page.locator("code").first().innerText();
}

async function openAccordion(page: Page, name: string) {
  const button = page.getByRole("button", { name, exact: true });
  await button.scrollIntoViewIfNeeded();
  if ((await button.getAttribute("aria-expanded")) !== "true") {
    await button.click();
  }
  await expect(button).toHaveAttribute("aria-expanded", "true");
}

test.describe("monitoring architecture", () => {
  test("ARM64 shows Enable Monitoring and emits the stack in compose", async ({
    page,
  }) => {
    await page.goto("/?architecture=linux%2Farm64");
    await expect(page.getByRole("radio", { name: "Linux ARM64" })).toBeChecked();

    await openAccordion(page, "Monitoring");
    await expect(page.getByText(/only available on/i)).toHaveCount(0);
    await expect(page.getByLabel("Enable Monitoring")).toBeVisible();

    await page.getByLabel("Enable Monitoring").click();
    const yaml = await composeYaml(page);
    for (const image of MONITORING_IMAGES) {
      expect(yaml, `ARM compose should include ${image}`).toContain(image);
    }
    expect(yaml).not.toContain("metal3d/xmrig");
  });

  test("ARM64 canned isMonitoring=true includes monitoring images", async ({
    page,
  }) => {
    await page.goto(
      "/?architecture=linux%2Farm64&isMonitoring=true&p2PoolMode=none&miningMode=none",
    );
    await expect(page.getByRole("radio", { name: "Linux ARM64" })).toBeChecked();

    const yaml = await composeYaml(page);
    expect(yaml).toContain("grafana/grafana:latest");
    expect(yaml).toContain("prom/prometheus:latest");
    expect(yaml).toContain("lalanza808/exporter:1.0.0");
    expect(yaml).toContain("lalanza808/nodemapper:1.0.4");
  });

  test("switching from AMD64 to ARM64 keeps monitoring and drops XMRig", async ({
    page,
  }) => {
    await page.goto(
      "/?architecture=linux%2Famd64&isMonitoring=true&p2PoolMode=full&miningMode=xmrig",
    );
    await expect(page.getByRole("radio", { name: "Linux AMD64" })).toBeChecked();

    let yaml = await composeYaml(page);
    expect(yaml).toContain("grafana/grafana:latest");
    expect(yaml).toContain("metal3d/xmrig");

    await page.getByText("Linux ARM64", { exact: true }).click();
    await expect(page.getByRole("radio", { name: "Linux ARM64" })).toBeChecked();

    yaml = await composeYaml(page);
    expect(yaml).toContain("grafana/grafana:latest");
    expect(yaml).toContain("prom/prometheus:latest");
    expect(yaml).not.toContain("metal3d/xmrig");
  });

  test("AMD64 still offers monitoring and XMRig", async ({ page }) => {
    await page.goto("/?architecture=linux%2Famd64&p2PoolMode=full");
    await expect(page.getByRole("radio", { name: "Linux AMD64" })).toBeChecked();

    await openAccordion(page, "Monitoring");
    await expect(page.getByLabel("Enable Monitoring")).toBeVisible();

    await openAccordion(page, "P2Pool");
    await expect(page.getByRole("radio", { name: /XMRig/i })).toBeEnabled();
  });

  test("ARM64 still disables XMRig", async ({ page }) => {
    await page.goto("/?architecture=linux%2Farm64&p2PoolMode=full");
    await expect(page.getByRole("radio", { name: "Linux ARM64" })).toBeChecked();

    await openAccordion(page, "P2Pool");
    await expect(page.getByRole("radio", { name: /XMRig/i })).toBeDisabled();
  });

  test("mobile ARM64 still shows Enable Monitoring", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?architecture=linux%2Farm64");
    await expect(page.getByRole("radio", { name: "Linux ARM64" })).toBeChecked();

    await openAccordion(page, "Monitoring");
    await expect(page.getByLabel("Enable Monitoring")).toBeVisible();
  });
});
