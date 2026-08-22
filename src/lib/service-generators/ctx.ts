import type { FullConfig } from "@/lib/config-schema";

export type GenerationCtx = {
  zmqPubPort: number | null;
  isXmrigProxyOn: boolean;
  anyHiddenService: boolean;
};

export function anyHiddenService(tor: FullConfig["tor"]): boolean {
  return (
    tor.hsMonerod ||
    tor.hsMonerodP2P ||
    tor.hsStagenet ||
    tor.hsP2Pool ||
    tor.hsGrafana ||
    tor.hsLws ||
    tor.hsMoneroPay ||
    tor.hsXmrigProxy
  );
}
