import {
  Service,
  architectures,
} from "@/lib/service-types";
import { DOCKER_IMAGES, SERVICE_PORTS, MONEROD_PORTS } from "@/lib/constants";
import {
  getTraefikConfig,
  getPortBinding,
  getTorClientNetworkConfig,
} from "@/lib/docker-helpers";
import type { FullConfig } from "@/lib/config-schema";
import type { GenerationCtx } from "./ctx";
import { CERT_RESOLVER_NAME } from "./traefik";

export const createMoneroLwsService = (
  config: FullConfig,
  ctx: GenerationCtx
): Service => {
  const isTraefik = config.services.isTraefik && config.services.isTraefikLws;
  const zmqPubPort = ctx.zmqPubPort ?? MONEROD_PORTS.zmqPub;
  const { domain, labels } = getTraefikConfig(
    isTraefik,
    "monero-lws",
    config.services.lwsDomain,
    String(SERVICE_PORTS.moneroLws),
    CERT_RESOLVER_NAME
  );
  return {
    name: "Monero Light Wallet Server",
    description:
      "Scan view keys on your own node so mobile and light wallets (Cake, Skylight, MyMonero-compatible) do not need a third-party light-wallet server. New accounts must be approved via the admin API on port " +
      SERVICE_PORTS.moneroLwsAdmin +
      ". Access at " +
      (isTraefik ? domain : `http://localhost:${SERVICE_PORTS.moneroLws}`) +
      ".",
    checked: config.services.isMoneroLws,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    volumes: { "monero-lws-data": {} },
    code: {
      "monero-lws": {
        image: DOCKER_IMAGES.moneroLws,
        restart: "unless-stopped",
        container_name: "monero-lws",
        ports: [
          getPortBinding(config.networkMode, SERVICE_PORTS.moneroLws),
          getPortBinding(config.networkMode, SERVICE_PORTS.moneroLwsAdmin),
        ],
        volumes: [
          "monero-lws-data:/home/monero-lws/.bitmonero/light_wallet_server",
        ],
        depends_on: { monerod: { condition: "service_started" } },
        ...getTorClientNetworkConfig(config.tor.torProxyMode),
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
