import {
  Service,
  architectures,
  NetworkMode,
  TorProxyMode,
  torProxyModes,
} from "@/hooks/services/types";
import { DOCKER_IMAGES, SERVICE_PORTS } from "@/lib/constants";
import {
  getTraefikConfig,
  getPortBinding,
  getTorClientNetworkConfig,
} from "@/lib/docker-helpers";

export interface MoneroPayState {
  isMoneroPay: boolean;
  moneroPayDomain: string;
}

export const createMoneroPayService = (
  state: MoneroPayState,
  networkMode: NetworkMode,
  isTraefik: boolean,
  certResolverName: string,
  torProxyMode: TorProxyMode = torProxyModes.none
): Service => {
  const { labels } = getTraefikConfig(
    isTraefik,
    "moneropay",
    state.moneroPayDomain,
    String(SERVICE_PORTS.moneroPay),
    certResolverName
  );
  return {
    name: "MoneroPay",
    description:
      "HTTP API for receiving Monero payments. Creates a hot wallet named “wallet” on your wallet-rpc and tracks incoming transfers (including 0-conf). Persist data in the moneropay-data volume.",
    checked: state.isMoneroPay,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    volumes: { "moneropay-data": {} },
    code: {
      moneropay: {
        image: DOCKER_IMAGES.moneroPay,
        restart: "unless-stopped",
        container_name: "moneropay",
        ports: [getPortBinding(networkMode, SERVICE_PORTS.moneroPay)],
        volumes: ["moneropay-data:/app/sqlite"],
        environment: {
          RPC_ADDRESS: `http://monero-wallet-rpc:${SERVICE_PORTS.moneroWalletRpc}/json_rpc`,
          SQLITE: "file:/app/sqlite/db.sqlite",
          BIND: `0.0.0.0:${SERVICE_PORTS.moneroPay}`,
          ZERO_CONF: "true",
        },
        depends_on: { "monero-wallet-rpc": { condition: "service_started" } },
        ...getTorClientNetworkConfig(torProxyMode),
        labels,
      },
    },
  };
};
