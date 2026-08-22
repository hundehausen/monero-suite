import {
  Service,
  architectures,
} from "@/lib/service-types";
import { DOCKER_IMAGES, SERVICE_PORTS } from "@/lib/constants";
import {
  getTraefikConfig,
  getPortBinding,
  getTorClientNetworkConfig,
} from "@/lib/docker-helpers";
import type { FullConfig } from "@/lib/config-schema";
import { CERT_RESOLVER_NAME } from "./traefik";

export const createMoneroPayService = (
  config: FullConfig
): Service => {
  const isTraefik = config.services.isTraefik && config.services.isTraefikMoneroPay;
  const { labels } = getTraefikConfig(
    isTraefik,
    "moneropay",
    config.services.moneroPayDomain,
    String(SERVICE_PORTS.moneroPay),
    CERT_RESOLVER_NAME
  );
  return {
    name: "MoneroPay",
    description:
      "HTTP API for receiving Monero payments. Creates a hot wallet named “wallet” on your wallet-rpc and tracks incoming transfers (including 0-conf). Persist data in the moneropay-data volume.",
    checked: config.services.isMoneroPay,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    volumes: { "moneropay-data": {} },
    code: {
      moneropay: {
        image: DOCKER_IMAGES.moneroPay,
        restart: "unless-stopped",
        container_name: "moneropay",
        ports: [getPortBinding(config.networkMode, SERVICE_PORTS.moneroPay)],
        volumes: ["moneropay-data:/app/sqlite"],
        environment: {
          RPC_ADDRESS: `http://monero-wallet-rpc:${SERVICE_PORTS.moneroWalletRpc}/json_rpc`,
          RPC_USERNAME: "${WALLET_RPC_USER}",
          RPC_PASSWORD: "${WALLET_RPC_PASSWORD}",
          SQLITE: "file:/app/sqlite/db.sqlite",
          BIND: `0.0.0.0:${SERVICE_PORTS.moneroPay}`,
          ZERO_CONF: "true",
        },
        depends_on: { "monero-wallet-rpc": { condition: "service_healthy" } },
        ...getTorClientNetworkConfig(config.tor.torProxyMode),
        labels,
      },
    },
  };
};
