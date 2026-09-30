import type { FullConfig } from "@/lib/config-schema";
import { p2poolModes, type P2PoolMode } from "@/lib/service-types";

export type GenerationCtx = {
  zmqPubPort: number | null;
  anyHiddenService: boolean;
};

export function anyHiddenService(
  tor: FullConfig["tor"],
  p2PoolMode: P2PoolMode,
): boolean {
  return (
    tor.hsMonerod ||
    tor.hsMonerodP2P ||
    tor.hsStagenet ||
    (tor.hsP2Pool && p2PoolMode !== p2poolModes.none) ||
    tor.hsGrafana ||
    tor.hsLws ||
    tor.hsMoneroPay
  );
}
