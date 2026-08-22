// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInstallScript } from "./use-install-script";
import type { FullConfig } from "@/lib/config-schema";
import { makeFullConfig } from "@/lib/make-full-config";

vi.mock("@/app/actions", () => ({
  uploadInstallScript: vi.fn(async () => "https://monerosuite.app/install/abc123"),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

import { uploadInstallScript } from "@/app/actions";
import { notifications } from "@mantine/notifications";

const configA: FullConfig = makeFullConfig();

const changedConfig: FullConfig = makeFullConfig({
  monerod: { outPeers: "96" },
});

describe("useInstallScript", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the stale install command when the config changes after an upload (fix 3)", async () => {
    const { result, rerender } = renderHook(
      ({ config }: { config: FullConfig }) => useInstallScript({ config }),
      { initialProps: { config: configA } }
    );

    // No command before generation
    expect(result.current.installationCommand).toBeUndefined();

    // Generate: command appears
    await act(async () => {
      await result.current.handleScriptGeneration();
    });
    expect(uploadInstallScript).toHaveBeenCalledTimes(1);
    expect(result.current.installationCommand).toBe(
      "curl -sSL https://monerosuite.app/install/abc123 | bash"
    );
    expect(result.current.currentConfigIsUploaded).toBe(true);

    // Change config -> stale command must be cleared
    await act(async () => {
      rerender({ config: changedConfig });
    });
    expect(result.current.currentConfigIsUploaded).toBe(false);
    expect(result.current.installationCommand).toBeUndefined();
  });

  it("surfaces a generic error notification when upload fails", async () => {
    vi.mocked(uploadInstallScript).mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useInstallScript({ config: configA }));
    await act(async () => {
      await result.current.handleScriptGeneration();
    });
    expect(result.current.installationCommand).toBeUndefined();
  });

  it("shows the real validation error and never calls the server action when config is invalid", async () => {
    const invalidConfig: FullConfig = {
      ...configA,
      p2pool: {
        ...configA.p2pool,
        p2PoolMode: "mini",
        p2PoolPayoutAddress: "4" + "A".repeat(60) + "O" + "A".repeat(33),
      },
    };

    const { result } = renderHook(() => useInstallScript({ config: invalidConfig }));
    await act(async () => {
      await result.current.handleScriptGeneration();
    });

    expect(uploadInstallScript).not.toHaveBeenCalled();
    expect(notifications.show).toHaveBeenCalledTimes(1);
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("p2pool.p2PoolPayoutAddress"),
      })
    );
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("must be a primary Monero address"),
      })
    );
    expect(result.current.installationCommand).toBeUndefined();
  });
});
