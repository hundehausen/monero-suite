import type { FullConfig } from "@/lib/config-schema";
import {
  DEFAULT_GRAFANA_ADMIN_PASSWORD,
  DEFAULT_WALLET_RPC_PASSWORD,
} from "@/lib/constants";

export type DefaultSecretWarning = {
  path: "services.grafanaAdminPassword" | "services.walletRpcPassword";
  section: "monitoring" | "monero-wallet-rpc";
  message: string;
};

export function getDefaultSecretWarnings(
  config: FullConfig
): DefaultSecretWarning[] {
  const warnings: DefaultSecretWarning[] = [];
  if (
    config.services.isMonitoring &&
    config.services.grafanaAdminPassword === DEFAULT_GRAFANA_ADMIN_PASSWORD
  ) {
    warnings.push({
      path: "services.grafanaAdminPassword",
      section: "monitoring",
      message:
        "Grafana still uses the shipped admin password. Change it in the Monitoring section before deploying.",
    });
  }
  if (
    config.services.isMoneroWalletRpc &&
    config.services.walletRpcPassword === DEFAULT_WALLET_RPC_PASSWORD
  ) {
    warnings.push({
      path: "services.walletRpcPassword",
      section: "monero-wallet-rpc",
      message:
        "Wallet RPC still uses the shipped password changeme. Change it in the Monero Wallet RPC section before deploying.",
    });
  }
  return warnings;
}
