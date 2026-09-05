import {
  Service,
  architectures,
  watchtowerUpdateFrequencies,
  watchtowerCooldownDelays,
  type WatchtowerUpdateFrequency,
  type WatchtowerCooldownDelay,
} from "@/lib/service-types";
import { DOCKER_IMAGES } from "@/lib/constants";
import type { FullConfig } from "@/lib/config-schema";

export const WATCHTOWER_POLL_INTERVAL_SECONDS = {
  [watchtowerUpdateFrequencies.hourly]: 3600,
  [watchtowerUpdateFrequencies.daily]: 86400,
  [watchtowerUpdateFrequencies.weekly]: 604800,
} as const satisfies Record<WatchtowerUpdateFrequency, number>;

export function watchtowerCooldownDelayEnv(
  delay: WatchtowerCooldownDelay
): string | undefined {
  if (delay === watchtowerCooldownDelays.none) return undefined;
  return delay;
}

export const createWatchtowerService = (
  config: FullConfig
): Service => {
  const cooldownDelay = watchtowerCooldownDelayEnv(
    config.services.watchtowerCooldownDelay
  );
  return {
    name: "Watchtower",
    description:
      "Automatically updates your Docker containers when new image versions are available. Keeps your Monero software up-to-date without manual intervention.",
    checked: config.services.isWatchtower,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    code: {
      watchtower: {
        image: DOCKER_IMAGES.watchtower,
        container_name: "watchtower",
        restart: "unless-stopped",
        environment: {
          WATCHTOWER_CLEANUP: true,
          WATCHTOWER_POLL_INTERVAL:
            WATCHTOWER_POLL_INTERVAL_SECONDS[config.services.watchtowerUpdateFrequency],
          ...(cooldownDelay !== undefined
            ? { WATCHTOWER_COOLDOWN_DELAY: cooldownDelay }
            : {}),
        },
        volumes: ["/var/run/docker.sock:/var/run/docker.sock"],
      },
    },
  };
};
