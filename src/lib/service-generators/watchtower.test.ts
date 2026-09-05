import { describe, expect, it } from "vitest";
import {
  createWatchtowerService,
  WATCHTOWER_POLL_INTERVAL_SECONDS,
  watchtowerCooldownDelayEnv,
} from "./watchtower";
import {
  watchtowerUpdateFrequencies,
  watchtowerCooldownDelays,
  type WatchtowerCooldownDelay,
} from "@/lib/service-types";
import { makeFullConfig } from "@/lib/make-full-config";
import { generateDockerComposeFile } from "@/app/utils";

type WatchtowerContainer = {
  environment?: {
    WATCHTOWER_CLEANUP?: boolean;
    WATCHTOWER_POLL_INTERVAL?: number;
    WATCHTOWER_COOLDOWN_DELAY?: string;
  };
};

const watchtowerEnv = (
  overrides: {
    watchtowerUpdateFrequency?: keyof typeof WATCHTOWER_POLL_INTERVAL_SECONDS;
    watchtowerCooldownDelay?: WatchtowerCooldownDelay;
  } = {}
) => {
  const service = createWatchtowerService(
    makeFullConfig({
      services: { isWatchtower: true, ...overrides },
    })
  );
  return service.code.watchtower as WatchtowerContainer;
};

describe("createWatchtowerService", () => {
  it("defaults to hourly polling (3600s) and a 24h image cooldown", () => {
    const env = watchtowerEnv().environment;
    expect(env?.WATCHTOWER_CLEANUP).toBe(true);
    expect(env?.WATCHTOWER_POLL_INTERVAL).toBe(3600);
    expect(env?.WATCHTOWER_COOLDOWN_DELAY).toBe("24h");
  });

  it.each([
    [watchtowerUpdateFrequencies.hourly, 3600],
    [watchtowerUpdateFrequencies.daily, 86400],
    [watchtowerUpdateFrequencies.weekly, 604800],
  ] as const)("maps %s to WATCHTOWER_POLL_INTERVAL %i", (frequency, seconds) => {
    expect(WATCHTOWER_POLL_INTERVAL_SECONDS[frequency]).toBe(seconds);
    expect(
      watchtowerEnv({ watchtowerUpdateFrequency: frequency }).environment
        ?.WATCHTOWER_POLL_INTERVAL
    ).toBe(seconds);
  });

  it.each([
    [watchtowerCooldownDelays.none, undefined],
    [watchtowerCooldownDelays["12h"], "12h"],
    [watchtowerCooldownDelays["24h"], "24h"],
    [watchtowerCooldownDelays["3d"], "3d"],
    [watchtowerCooldownDelays["7d"], "7d"],
  ] as const)("maps cooldown %s to env %s", (delay, expected) => {
    expect(watchtowerCooldownDelayEnv(delay)).toBe(expected);
    const env = watchtowerEnv({ watchtowerCooldownDelay: delay }).environment;
    if (expected === undefined) {
      expect(env).not.toHaveProperty("WATCHTOWER_COOLDOWN_DELAY");
    } else {
      expect(env?.WATCHTOWER_COOLDOWN_DELAY).toBe(expected);
    }
  });

  it("keeps watchtower unchecked when the toggle is off, still using the selected interval in the spec", () => {
    const service = createWatchtowerService(
      makeFullConfig({
        services: { isWatchtower: false, watchtowerUpdateFrequency: "weekly" },
      })
    );
    expect(service.checked).toBe(false);
    expect(
      (service.code.watchtower as WatchtowerContainer).environment
        ?.WATCHTOWER_POLL_INTERVAL
    ).toBe(604800);
  });

  it("puts the selected interval and cooldown into generated compose YAML", () => {
    const config = makeFullConfig({
      services: {
        isWatchtower: true,
        watchtowerUpdateFrequency: "daily",
        watchtowerCooldownDelay: "3d",
      },
    });
    const compose = generateDockerComposeFile([createWatchtowerService(config)]);
    expect(compose.services?.watchtower?.environment).toMatchObject({
      WATCHTOWER_CLEANUP: true,
      WATCHTOWER_POLL_INTERVAL: 86400,
      WATCHTOWER_COOLDOWN_DELAY: "3d",
    });
  });

  it("omits WATCHTOWER_COOLDOWN_DELAY from compose when cooldown is none", () => {
    const config = makeFullConfig({
      services: { isWatchtower: true, watchtowerCooldownDelay: "none" },
    });
    const compose = generateDockerComposeFile([createWatchtowerService(config)]);
    expect(compose.services?.watchtower?.environment).not.toHaveProperty(
      "WATCHTOWER_COOLDOWN_DELAY"
    );
  });
});
