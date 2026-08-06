import { describe, expect, it } from "vitest";
import { generateAllServices } from "@/lib/service-generators";
import { generateDockerComposeFile } from "@/app/utils";
import type { FullConfig } from "@/lib/config-schema";
import type { Service } from "@/hooks/services/types";
import {
  DOCKER_IMAGES,
  DOCKER_NETWORK,
  MONEROD_PORTS,
  MONEROD_STAGENET_PORTS,
  P2POOL_PORTS,
  SERVICE_IPS,
  SERVICE_PORTS,
} from "@/lib/constants";
import { p2poolModes } from "@/hooks/services/types";
import { getP2PoolContainerName } from "@/lib/service-generators/p2pool";
import { CERT_RESOLVER_NAME } from "@/lib/service-generators/traefik";

/**
 * These tests map the *connections between services*: every place one
 * container talks to another (RPC ports, ZMQ, stratum, scrape targets,
 * hidden service forwards, Traefik backends, static IPs), the two ends
 * must agree. If you change a port, container name, or network on one
 * side, these tests should fail.
 */

const VALID_ADDRESS = `4${"1".repeat(94)}`;

const baseMonerod: FullConfig["monerod"] = {
  isMoneroPublicNode: false,
  moneroNodeNoLogs: false,
  moneroNodeDomain: "node.example.com",
  isPrunedNode: false,
  isSyncPrunedBlocks: false,
  isMoneroMainnetVolume: true,
  moneroMainnetBlockchainLocation: "",
  logLevel: "0",
  maxLogFileSize: "104850000",
  maxLogFiles: "50",
  p2pBindPort: "18080",
  outPeers: "64",
  inPeers: "32",
  limitRateUp: "1048576",
  limitRateDown: "2048",
  noIgd: false,
  hidePort: false,
  allowLocalIp: false,
  maxConnectionsPerIp: "1",
  p2pExternalPort: "0",
  offlineMode: false,
  padTransactions: false,
  anonymousInbound: "",
  txProxyDisableNoise: false,
  banList: "",
  enableDnsBlocklist: false,
  disableDnsCheckpoints: false,
  seedNode: "",
  addPeer: "",
  addPriorityNode: "",
  addExclusiveNode: "",
  dbSyncMode: "",
  blockSyncSize: "0",
  enforceCheckpointing: false,
  fastBlockSync: true,
  preparationThreads: "4",
  maxConcurrency: "0",
  bootstrapDaemonAddress: "",
  bootstrapDaemonLogin: "",
  zmqPubEnabled: false,
  zmqPubBindPort: "18083",
  rpcSsl: "autodetect",
  rpcLogin: "",
  disableRpcBan: false,
  maxTxpoolWeight: "0",
  startMining: "",
  miningThreads: "1",
  bgMiningEnable: false,
  bgMiningIgnoreBattery: false,
  blockNotify: "",
  reorgNotify: "",
  blockRateNotify: "",
};

/** A config with every optional service enabled. */
const makeConfig = (overrides: Partial<FullConfig> = {}): FullConfig => ({
  architecture: "linux/amd64",
  networkMode: "local",
  monerod: { ...baseMonerod },
  stagenet: {
    isStagenetNode: true,
    isStagenetNodePublic: false,
    isMoneroStagenetCustomLocation: false,
    moneroStagenetBlockchainLocation: "",
    stagenetNodeDomain: "stagenet.example.com",
  },
  p2pool: {
    p2PoolMode: p2poolModes.full,
    p2PoolPayoutAddress: VALID_ADDRESS,
    p2PoolMiningThreads: 4,
  },
  mining: { miningMode: "xmrig", xmrigDonateLevel: 1 },
  tor: {
    torProxyMode: "none",
    hsMonerod: true,
    hsMonerodP2P: true,
    hsStagenet: true,
    hsP2Pool: true,
    hsGrafana: true,
    isGlobalTorProxy: false,
  },
  services: {
    isMoneroWalletRpc: true,
    isWatchtower: true,
    isMonitoring: true,
    grafanaDomain: "grafana.example.com",
    isTraefik: true,
    isTraefikMonerod: true,
    isTraefikStagenet: true,
    isTraefikGrafana: true,
    isTraefikPortainer: true,
    isPortainer: true,
    portainerDomain: "portainer.example.com",
    isCuprateEnabled: true,
  },
  enabledBashServices: { monitoring: true, cuprate: true },
  ...overrides,
});

const checkedServicesOf = (config: FullConfig): Service[] =>
  Object.values(generateAllServices(config)).filter(
    (s) => s.checked !== false && s.checked !== "none"
  );

type ContainerSpec = {
  container_name?: string;
  command?: string[] | string;
  ports?: Array<string | number>;
  environment?: Record<string, string | number | boolean>;
  depends_on?: Record<string, unknown>;
  networks?: Record<string, unknown>;
  labels?: Record<string, string>;
  healthcheck?: { test?: string | string[] };
  volumes?: string[];
  image?: string;
};

const cmd = (c: ContainerSpec): string[] =>
  Array.isArray(c.command) ? c.command : [c.command ?? ""];

/** Find the value following a flag in a command array, e.g. flagValue(cmd, "--rpc-port") */
const flagValue = (command: string[], flag: string): string | undefined =>
  command[command.indexOf(flag) + 1];

describe("monerod <-> p2pool connection", () => {
  it.each([p2poolModes.full, p2poolModes.mini, p2poolModes.nano])(
    "p2pool (%s) reaches monerod's restricted RPC and ZMQ pub ports that monerod actually binds",
    (mode) => {
      const services = generateAllServices(
        makeConfig({ p2pool: { p2PoolMode: mode, p2PoolPayoutAddress: VALID_ADDRESS, p2PoolMiningThreads: 4 } })
      );
      const monerod = services.monerod.code.monerod as ContainerSpec;
      const p2pool = services.p2pool.code[getP2PoolContainerName(mode)] as ContainerSpec;
      const monerodCmd = cmd(monerod);
      const p2poolCmd = cmd(p2pool);

      // monerod binds restricted RPC and ZMQ pub...
      expect(monerodCmd).toContain(`--rpc-restricted-bind-port=${MONEROD_PORTS.rpcRestricted}`);
      expect(monerodCmd).toContain(`--zmq-pub=tcp://0.0.0.0:${MONEROD_PORTS.zmqPub}`);
      expect(monerodCmd).not.toContain("--no-zmq");
      // ...and p2pool points at exactly those ports
      expect(flagValue(p2poolCmd, "--rpc-port")).toBe(String(MONEROD_PORTS.rpcRestricted));
      expect(flagValue(p2poolCmd, "--zmq-port")).toBe(String(MONEROD_PORTS.zmqPub));
      // p2pool targets the monerod container by name and waits for it
      expect(flagValue(p2poolCmd, "--host")).toBe(monerod.container_name);
      expect(p2pool.depends_on).toHaveProperty("monerod");
    }
  );

  it("keeps the ZMQ feed off the host when p2pool is enabled (Docker-network only)", () => {
    const services = generateAllServices(makeConfig());
    const monerod = services.monerod.code.monerod as ContainerSpec;
    const monerodCmd = cmd(monerod);
    // monerod still enables ZMQ for p2pool...
    expect(monerodCmd).toContain(`--zmq-pub=tcp://0.0.0.0:${MONEROD_PORTS.zmqPub}`);
    // ...but the port is reachable only inside the Docker network
    expect(monerod.ports).not.toContain(`${MONEROD_PORTS.zmqPub}:${MONEROD_PORTS.zmqPub}`);
    expect(monerod.ports).not.toContain(`127.0.0.1:${MONEROD_PORTS.zmqPub}:${MONEROD_PORTS.zmqPub}`);
  });

  it("propagates a custom ZMQ pub port from monerod to p2pool and monitoring, and never publishes it on the host", () => {
    const customPort = "18090";
    const services = generateAllServices(
      makeConfig({ monerod: { ...baseMonerod, zmqPubEnabled: true, zmqPubBindPort: customPort } })
    );
    const monerod = services.monerod.code.monerod as ContainerSpec;
    const p2pool = services.p2pool.code.p2pool as ContainerSpec;

    // monerod binds ZMQ on the custom port...
    expect(cmd(monerod)).toContain(`--zmq-pub=tcp://0.0.0.0:${customPort}`);
    // ...p2pool and monitoring point at exactly that port...
    expect(flagValue(cmd(p2pool), "--zmq-port")).toBe(customPort);
    expect(services.monitoring.env?.ZMQ_PORT).toBe(Number(customPort));
    // ...and no host port is published for it
    for (const p of monerod.ports ?? []) {
      expect(String(p)).not.toContain(customPort);
    }
  });

  it("monerod uses --no-zmq when neither p2pool nor monitoring need ZMQ", () => {
    const services = generateAllServices(
      makeConfig({
        p2pool: { p2PoolMode: "none", p2PoolPayoutAddress: "", p2PoolMiningThreads: 1 },
        services: { ...makeConfig().services, isMonitoring: false },
      })
    );
    const monerodCmd = cmd(services.monerod.code.monerod as ContainerSpec);
    expect(monerodCmd).toContain("--no-zmq");
  });
});

describe("xmrig <-> p2pool connection", () => {
  it.each([p2poolModes.full, p2poolModes.mini, p2poolModes.nano])(
    "xmrig POOL_URL points at the right p2pool container and stratum port (%s)",
    (mode) => {
      const services = generateAllServices(
        makeConfig({ p2pool: { p2PoolMode: mode, p2PoolPayoutAddress: VALID_ADDRESS, p2PoolMiningThreads: 4 } })
      );
      const containerName = getP2PoolContainerName(mode);
      const p2pool = services.p2pool.code[containerName] as ContainerSpec;
      const xmrig = services.xmrig.code.xmrig as ContainerSpec;

      expect(xmrig.environment?.POOL_URL).toBe(`${containerName}:${P2POOL_PORTS.stratum}`);
      // p2pool actually binds and publishes that stratum port
      expect(flagValue(cmd(p2pool), "--stratum")).toBe(`0.0.0.0:${P2POOL_PORTS.stratum}`);
      expect(p2pool.ports).toContain(`${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}`);
    }
  );
});

describe("monitoring stack connections", () => {
  const services = generateAllServices(makeConfig());
  const monitoring = services.monitoring.code as Record<string, ContainerSpec>;
  const monerodCmd = cmd(services.monerod.code.monerod as ContainerSpec);

  it("exporter and nodemapper target monerod's unrestricted RPC port that monerod binds", () => {
    expect(monerodCmd).toContain(`--rpc-bind-port=${MONEROD_PORTS.rpcUnrestricted}`);
    expect(monitoring.exporter.command).toBe(
      `--monero-addr=http://monerod:${MONEROD_PORTS.rpcUnrestricted}`
    );
    expect(monitoring.nodemapper.environment?.NODE_HOST).toBe("monerod");
    expect(monitoring.nodemapper.environment?.NODE_PORT).toBe(String(MONEROD_PORTS.rpcUnrestricted));
  });

  it("uses the image names the downloaded upstream configs hardcode", () => {
    // The Prometheus config downloaded from lalanza808/docker-monero-node scrapes
    // "exporter:9000" and "nodemapper:5000", and the Grafana datasource points at
    // "http://prometheus:9090" — the compose service keys must stay exactly these.
    expect(Object.keys(monitoring)).toEqual(
      expect.arrayContaining(["prometheus", "exporter", "nodemapper", "grafana"])
    );
    expect(monitoring.exporter.image).toBe("lalanza808/exporter:1.0.0");
    expect(monitoring.nodemapper.image).toBe("lalanza808/nodemapper:1.0.4");
  });

  it("exporter/nodemapper wait for a healthy monerod, and monerod defines a healthcheck", () => {
    expect(monitoring.exporter.depends_on?.monerod).toEqual({ condition: "service_healthy" });
    expect(monitoring.nodemapper.depends_on?.monerod).toEqual({ condition: "service_healthy" });
    const monerod = services.monerod.code.monerod as ContainerSpec;
    expect(monerod.healthcheck?.test).toBeTruthy();
  });

  it("monerod healthcheck tolerates 401 so --rpc-login doesn't block dependents", () => {
    const monerod = services.monerod.code.monerod as ContainerSpec;
    const test = monerod.healthcheck?.test;
    const testStr = Array.isArray(test) ? test.join(" ") : String(test);
    expect(testStr).toContain(String(MONEROD_PORTS.rpcUnrestricted));
    expect(testStr).toContain("401");
  });

  it("grafana is reachable on its service port and wired to the prometheus datasource name", () => {
    expect(monitoring.grafana.ports).toContain(`${SERVICE_PORTS.grafana}:${SERVICE_PORTS.grafana}`);
    // datasource all.yaml points at http://prometheus:9090 — service key must stay "prometheus"
    expect(monitoring.prometheus.container_name).toBe("prometheus");
  });
});

describe("monero-wallet-rpc <-> monerod connection", () => {
  it("points at monerod's restricted RPC port", () => {
    const services = generateAllServices(makeConfig());
    const walletRpc = services["monero-wallet-rpc"].code["monero-wallet-rpc"] as ContainerSpec;
    expect(cmd(walletRpc)).toContain(`--daemon-address=monerod:${MONEROD_PORTS.rpcRestricted}`);
  });

  it("passes every CLI argument as a single argv entry (no embedded spaces)", () => {
    const services = generateAllServices(makeConfig());
    const walletRpc = services["monero-wallet-rpc"].code["monero-wallet-rpc"] as ContainerSpec;
    for (const arg of cmd(walletRpc)) {
      expect(arg.trim()).not.toMatch(/\s/);
    }
  });
});

describe("tor connections", () => {
  it("hidden service forwards point at real containers and their actual ports", () => {
    const services = generateAllServices(makeConfig());
    const tor = services.tor.code.tor as ContainerSpec;
    const env = tor.environment ?? {};

    expect(env.HS_MONEROD_MAINNET).toBe(
      `monerod:${MONEROD_PORTS.rpcRestricted}:${MONEROD_PORTS.rpcRestricted}`
    );
    expect(env.HS_P2POOL).toBe(`p2pool:${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}`);
    expect(env.HS_GRAFANA).toBe(`grafana:${SERVICE_PORTS.grafana}:80`);
    expect(env.HS_MONEROD_MAINNET_STAGENET).toBe(
      `monerod-stagenet:${MONEROD_STAGENET_PORTS.rpcRestricted}:${MONEROD_STAGENET_PORTS.rpcRestricted}`
    );
  });

  it("monerod routes through the tor container's static IP on the tor-proxy network", () => {
    const services = generateAllServices(
      makeConfig({ tor: { ...makeConfig().tor, torProxyMode: "full" } })
    );
    const monerodCmd = cmd(services.monerod.code.monerod as ContainerSpec);
    const tor = services.tor.code.tor as ContainerSpec;
    const torNetworks = tor.networks as Record<string, { ipv4_address?: string }>;

    expect(torNetworks[DOCKER_NETWORK.name].ipv4_address).toBe(SERVICE_IPS.tor);
    expect(monerodCmd).toContain(`--proxy=${SERVICE_IPS.tor}:${SERVICE_PORTS.torSocks}`);
    expect(monerodCmd.some((a) => a.startsWith(`--tx-proxy=tor,${SERVICE_IPS.tor}:${SERVICE_PORTS.torSocks}`))).toBe(true);
  });

  it("p2pool reaches monerod via its static tor-net IP with DNS disabled", () => {
    const services = generateAllServices(
      makeConfig({ tor: { ...makeConfig().tor, torProxyMode: "tx-only" } })
    );
    const p2poolCmd = cmd(services.p2pool.code.p2pool as ContainerSpec);
    expect(flagValue(p2poolCmd, "--host")).toBe(SERVICE_IPS.monerod);
    expect(p2poolCmd).toContain("--no-dns");
  });

  it("all static service IPs sit inside the tor-proxy subnet", () => {
    const subnetPrefix = DOCKER_NETWORK.subnet.split("/")[0].split(".").slice(0, 3).join(".");
    for (const ip of Object.values(SERVICE_IPS)) {
      expect(ip.startsWith(`${subnetPrefix}.`)).toBe(true);
    }
  });
});

describe("traefik connections", () => {
  const services = generateAllServices(makeConfig());

  it("traefik publishes the entrypoints its command configures", () => {
    const traefik = services.traefik.code.traefik as ContainerSpec;
    expect(traefik.ports).toEqual(expect.arrayContaining(["80:80", "443:443"]));
    expect(cmd(traefik)).toContain("--entrypoints.websecure.address=:443");
  });

  it("every service's traefik loadbalancer port matches a port the service serves", () => {
    // container key -> traefik router name used in its labels
    const expected: Record<string, [string, string]> = {
      monerod: ["monerod", String(MONEROD_PORTS.rpcRestricted)],
      "monerod-stagenet": ["monerod-stagenet", String(MONEROD_STAGENET_PORTS.rpcRestricted)],
      grafana: ["monitoring", String(SERVICE_PORTS.grafana)],
      portainer: ["portainer", String(SERVICE_PORTS.portainer)],
    };
    const all = Object.values(services).reduce(
      (acc, s) => ({ ...acc, ...(s.code as Record<string, ContainerSpec>) }),
      {} as Record<string, ContainerSpec>
    );
    for (const [key, [router, port]] of Object.entries(expected)) {
      const container = all[key];
      const labelKey = `traefik.http.services.${router}.loadbalancer.server.port`;
      expect(container.labels?.[labelKey], `${key} loadbalancer port`).toBe(port);
    }
  });

  it("label certresolver matches the resolver traefik actually defines", () => {
    const traefik = services.traefik.code.traefik as ContainerSpec;
    expect(cmd(traefik)).toContain(
      `--certificatesresolvers.${CERT_RESOLVER_NAME}.acme.tlschallenge=true`
    );
    const grafana = services.monitoring.code.grafana as ContainerSpec;
    expect(grafana.labels?.["traefik.http.routers.monitoring.tls.certresolver"]).toBe(CERT_RESOLVER_NAME);
  });
});

describe("cuprate service", () => {
  it("maps the host RPC port to cuprated's restricted RPC port (not the P2P port)", () => {
    const services = generateAllServices(makeConfig());
    const cuprate = services.cuprate.code.cuprate as ContainerSpec;
    expect(cuprate.ports).toContain(`${SERVICE_PORTS.cuprateRpc}:18089`);
  });

  it("persists data at cuprated's real data dir and mounts a config enabling RPC", () => {
    const services = generateAllServices(makeConfig());
    const cuprateService = services.cuprate;
    const cuprate = cuprateService.code.cuprate as ContainerSpec;

    expect(cuprate.volumes).toContain("cuprate-data:/home/cuprate/.local/share/cuprate");
    expect(
      cuprate.volumes?.some((v) => v.endsWith(":/home/cuprate/.config/cuprate/Cuprated.toml:ro"))
    ).toBe(true);
    // the install script must download that config from the image maintainer's repo
    expect(cuprateService.bash).toContain("Cuprated.toml");
    expect(cuprateService.bash).toContain("hundehausen/cuprate-docker");
  });
});

describe("compose-wide invariants (all services enabled)", () => {
  it.each(["local", "exposed"] as const)("no two containers publish the same host port (%s mode)", (networkMode) => {
    const config = makeConfig({ networkMode });
    const checked = checkedServicesOf(config);
    const compose = generateDockerComposeFile(checked);
    const hostPorts = new Map<string, string>();

    for (const [name, spec] of Object.entries(compose.services ?? {})) {
      for (const p of (spec as ContainerSpec).ports ?? []) {
        const parts = String(p).split(":");
        const hostPort = parts.length === 1 ? parts[0] : parts[parts.length - 2];
        expect(
          hostPorts.has(hostPort),
          `host port ${hostPort} claimed by both ${hostPorts.get(hostPort)} and ${name}`
        ).toBe(false);
        hostPorts.set(hostPort, name);
      }
    }
  });

  it("every depends_on target exists as a compose service", () => {
    const compose = generateDockerComposeFile(checkedServicesOf(makeConfig()));
    const names = Object.keys(compose.services ?? {});
    for (const [name, spec] of Object.entries(compose.services ?? {})) {
      for (const dep of Object.keys((spec as ContainerSpec).depends_on ?? {})) {
        expect(names, `${name} depends on missing service ${dep}`).toContain(dep);
      }
    }
  });

  it("container names are unique", () => {
    const compose = generateDockerComposeFile(checkedServicesOf(makeConfig()));
    const names = Object.values(compose.services ?? {}).map(
      (s) => (s as ContainerSpec).container_name
    );
    expect(new Set(names).size).toBe(names.length);
  });

  it("all images come from the centralized DOCKER_IMAGES registry", () => {
    const compose = generateDockerComposeFile(checkedServicesOf(makeConfig()));
    const allowed = new Set<string>(Object.values(DOCKER_IMAGES));
    for (const spec of Object.values(compose.services ?? {})) {
      expect(allowed.has((spec as ContainerSpec).image ?? "")).toBe(true);
    }
  });
});
