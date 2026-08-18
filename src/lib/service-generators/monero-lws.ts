import {
  Service,
  architectures,
  NetworkMode,
  TorProxyMode,
  torProxyModes,
} from "@/lib/service-types";
import { DOCKER_IMAGES, SERVICE_PORTS, MONEROD_PORTS } from "@/lib/constants";
import {
  getTraefikConfig,
  getPortBinding,
  getTorClientNetworkConfig,
} from "@/lib/docker-helpers";

export interface MoneroLwsState {
  isMoneroLws: boolean;
  lwsDomain: string;
}

export const createMoneroLwsService = (
  state: MoneroLwsState,
  networkMode: NetworkMode,
  isTraefik: boolean,
  certResolverName: string,
  torProxyMode: TorProxyMode = torProxyModes.none,
  zmqPubPort: number = MONEROD_PORTS.zmqPub
): Service => {
  const { domain, labels } = getTraefikConfig(
    isTraefik,
    "monero-lws",
    state.lwsDomain,
    String(SERVICE_PORTS.moneroLws),
    certResolverName
  );
  return {
    name: "Monero Light Wallet Server",
    description:
      "Scan view keys on your own node so mobile and light wallets (Cake, Skylight, MyMonero-compatible) do not need a third-party light-wallet server. New accounts must be approved via the admin API on port " +
      SERVICE_PORTS.moneroLwsAdmin +
      ". Access at " +
      (isTraefik ? domain : `http://localhost:${SERVICE_PORTS.moneroLws}`) +
      ".",
    checked: state.isMoneroLws,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    volumes: { "monero-lws-data": {} },
    code: {
      "monero-lws": {
        image: DOCKER_IMAGES.moneroLws,
        restart: "unless-stopped",
        container_name: "monero-lws",
        ports: [
          getPortBinding(networkMode, SERVICE_PORTS.moneroLws),
          getPortBinding(networkMode, SERVICE_PORTS.moneroLwsAdmin),
        ],
        volumes: [
          "monero-lws-data:/home/monero-lws/.bitmonero/light_wallet_server",
        ],
        depends_on: { monerod: { condition: "service_started" } },
        ...getTorClientNetworkConfig(torProxyMode),
        labels,
        command: [
          `--daemon=tcp://monerod:${MONEROD_PORTS.zmqRpc}`,
          `--sub=tcp://monerod:${zmqPubPort}`,
          `--rest-server=http://0.0.0.0:${SERVICE_PORTS.moneroLws}`,
          `--admin-rest-server=http://0.0.0.0:${SERVICE_PORTS.moneroLwsAdmin}`,
          "--confirm-external-bind",
          "--max-subaddresses=50",
          "--log-level=1",
        ],
      },
    },
  };
};
