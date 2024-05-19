import { useEffect, useMemo, useState } from "react";
import {
  PropertiesServices,
  PropertiesVolumes,
} from "../../node_modules/compose-spec-schema/lib/type";

export interface Service {
  name: string;
  description: string;
  checked: boolean | string;
  required: boolean;
  bash?: string;
  code: PropertiesServices;
  volumes?: PropertiesVolumes;
  architecture: Architecture[];
}

export interface ServiceMap {
  [key: string]: Service;
}

const p2poolModes = {
  none: "none",
  mini: "mini",
  full: "full",
} as const;

export type P2PoolMode = (typeof p2poolModes)[keyof typeof p2poolModes];

const minigModes = {
  none: "none",
  xmrig: "xmrig",
  p2pool: "p2pool",
} as const;

export type MiningMode = (typeof minigModes)[keyof typeof minigModes];

const torProxyModes = {
  none: "none",
  txonly: "tx-only",
  full: "full",
} as const;

export type TorProxyMode = (typeof torProxyModes)[keyof typeof torProxyModes];

const architectures = {
  linuxAmd: "linux/amd64",
  linuxArm: "linux/arm64",
} as const;

export type Architecture = (typeof architectures)[keyof typeof architectures];

export const useServices = () => {
  const [architecture, setArchitecture] = useState<Architecture>(
    architectures.linuxAmd
  );
  const [isMoneroPublicNode, setIsMoneroPublicNode] = useState(true);
  const [moneroNodeNoLogs, setMoneroNodeNoLogs] = useState(false);
  const [moneroNodeDomain, setMoneroNodeDomain] = useState(
    "node.monerosuite.org"
  );
  const [isPrunedNode, setIsPrunedNode] = useState(false);
  const [isSyncPrunedBlocks, setIsSyncPrunedBlocks] = useState(false);
  const [isStagenetNode, setIsStagenetNode] = useState(false);
  const [isStagenetNodePublic, setIsStagenetNodePublic] = useState(true);
  const [stagenetNodeDomain, setStagenetNodeDomain] = useState(
    "stagenet.monerosuite.org"
  );
  const [p2PoolMode, setP2PoolMode] = useState<P2PoolMode>(p2poolModes.none);
  const [p2PoolPayoutAddress, setP2PoolPayoutAddress] = useState(
    "48oc8c65B9JPv6FBZBg7UN9xUYmxux6WfEh61WBoKca7Amh7r7bnCZ7JJicLw7UN3DEgEADwqrhwxGBJazPZ14PJGbmMyXX"
  );
  const [miningMode, setMiningMode] = useState<MiningMode>(minigModes.none);
  const [xmrigDonateLevel, setXmrigDonateLevel] = useState(1);
  const [p2PoolMiningThreads, setP2PoolMiningThreads] = useState(4);
  const [isMoneroWalletRpc, setIsMoneroWalletRpc] = useState(false);
  const [torProxyMode, setTorProxyMode] = useState<TorProxyMode>(
    torProxyModes.none
  );
  const [isHiddenServices, setIsHiddenServices] = useState(false);
  const [isWatchtower, setIsWatchtower] = useState(false);
  const [isMoneroblock, setIsMoneroblock] = useState(false);
  const [isMoneroblockLogging, setIsMoneroblockLogging] = useState(true);
  const [moneroBlockDomain, setMoneroBlockDomain] = useState(
    "explorer.monerosuite.org"
  );
  const [isOnionMoneroBlockchainExplorer, setIsOnionMoneroBlockchainExplorer] =
    useState(false);
  const [
    onionMoneroBlockchainExplorerDomain,
    setOnionMoneroBlockchainExplorerDomain,
  ] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [grafanaDomain, setGrafanaDomain] = useState("grafana.monerosuite.org");
  const [isAutoheal, setIsAutoheal] = useState(false);
  const [isTraefik, setIsTraefik] = useState(false);

  useEffect(() => {
    if (isTraefik) {
      setGrafanaDomain("grafana.monerosuite.org");
    } else {
      setGrafanaDomain("localhost:3000");
    }
  }, [isTraefik]);

  useEffect(() => {
    if (!isPrunedNode) setIsSyncPrunedBlocks(false);
  }, [isPrunedNode]);

  const services = useMemo<ServiceMap>(
    () =>
      ({
        monerod: {
          name: "Monero Node",
          description:
            "The Monero daemon, monerod, is the core software that runs the Monero network. It is responsible for storing the blockchain and synchronizing transactions.",
          checked: true,
          required: true,
          architecture: [architectures.linuxAmd, architectures.linuxArm],
          bash: isMoneroPublicNode
            ? `
# Allow monerod p2p port and restricted rpc port
sudo ufw allow 18080/tcp 18089/tcp`
            : undefined,
          volumes: {
            bitmonero: {},
          },
          code: {
            monerod: {
              image: "ghcr.io/sethforprivacy/simple-monerod:latest",
              restart: "unless-stopped",
              container_name: "monerod",
              volumes: ["bitmonero:/home/monero/.bitmonero"],
              ports: [
                ...(isMoneroPublicNode
                  ? ["18080:18080"]
                  : ["127.0.0.1:18080:18080"]),
                ...(p2PoolMode !== p2poolModes.none
                  ? isMoneroPublicNode
                    ? ["18084:18084"]
                    : ["127.0.0.1:18084:18084"]
                  : []),
                ...(isMoneroPublicNode
                  ? ["18089:18089"]
                  : ["127.0.0.1:18089:18089"]),
              ],
              depends_on:
                torProxyMode !== "none"
                  ? {
                      "tor-proxy": {
                        condition: "service_started",
                      },
                    }
                  : undefined,
              healthcheck: {
                test: "curl --fail http://localhost:18081/get_height || exit 1",
                interval: "60s",
                timeout: "5s",
                retries: 10,
                start_period: "40s",
              },
              command: [
                "--rpc-restricted-bind-ip=0.0.0.0",
                "--rpc-restricted-bind-port=18089",
                "--rpc-bind-ip=0.0.0.0",
                "--rpc-bind-port=18081",
                "--confirm-external-bind",
                "--enable-dns-blocklist",
                "--check-updates=disabled",
                ...(moneroNodeNoLogs
                  ? ["--log-file=/dev/null", "--max-log-file-size=0"]
                  : ["--max-log-files=3", "--max-log-file-size=1048576"]),
                "--no-igd",
                "--out-peers=64",
                "--limit-rate-down=1048576",
                ...(isPrunedNode ? ["--prune-blockchain"] : []),
                ...(isSyncPrunedBlocks ? ["--sync-pruned-blocks"] : []),
                ...(isMoneroPublicNode ? ["--public-node"] : []),
                ...(p2PoolMode !== p2poolModes.none || isMonitoring
                  ? ["--zmq-pub=tcp://0.0.0.0:18084"]
                  : ["--no-zmq"]),
                ...(isHiddenServices ? ["--disable-rpc-ban"] : []),
                ...(isHiddenServices && !isMoneroPublicNode
                  ? ["--rpc-ssl=disabled"]
                  : []),
                ...(torProxyMode === torProxyModes.full
                  ? ["--proxy=127.0.0.1:9150"]
                  : torProxyMode === torProxyModes.txonly
                  ? ["--tx-proxy=tor,127.0.0.1:9150,32"]
                  : []),
                ...(torProxyMode !== torProxyModes.none
                  ? [
                      "--add-priority-node=xwvz3ekocr3dkyxfkmgm2hvbpzx2ysqmaxgter7znnqrhoicygkfswid.onion:18083",
                      "--add-priority-node=4pixvbejrvihnkxmduo2agsnmc3rrulrqc7s3cbwwrep6h6hrzsibeqd.onion:18083",
                      "--add-priority-node=zbjkbsxc5munw3qusl7j2hpcmikhqocdf4pqhnhtpzw5nt5jrmofptid.onion:18083",
                      "--add-priority-node=plowsof3t5hogddwabaeiyrno25efmzfxyro2vligremt7sxpsclfaid.onion:18083",
                      "--add-priority-node=plowsoffjexmxalw73tkjmf422gq6575fc7vicuu4javzn2ynnte6tyd.onion:18083",
                      "--add-priority-node=qz43zul2x56jexzoqgkx2trzwcfnr6l3hbtfcfx54g4r3eahy3bssjyd.onion:18083",
                      "--add-peer=xwvz3ekocr3dkyxfkmgm2hvbpzx2ysqmaxgter7znnqrhoicygkfswid.onion:18083",
                      "--add-peer=4pixvbejrvihnkxmduo2agsnmc3rrulrqc7s3cbwwrep6h6hrzsibeqd.onion:18083",
                      "--add-peer=zbjkbsxc5munw3qusl7j2hpcmikhqocdf4pqhnhtpzw5nt5jrmofptid.onion:18083",
                      "--add-peer=plowsof3t5hogddwabaeiyrno25efmzfxyro2vligremt7sxpsclfaid.onion:18083",
                      "--add-peer=plowsoffjexmxalw73tkjmf422gq6575fc7vicuu4javzn2ynnte6tyd.onion:18083",
                      "--add-peer=qz43zul2x56jexzoqgkx2trzwcfnr6l3hbtfcfx54g4r3eahy3bssjyd.onion:18083",
                    ]
                  : []),
              ],
              logging: moneroNodeNoLogs ? { driver: "none" } : undefined,
              labels: isTraefik
                ? {
                    "traefik.enable": "true",
                    "traefik.http.routers.monerod.rule": `Host(\`${moneroNodeDomain}\`)`,
                    "traefik.http.routers.monerod.entrypoints": "websecure",
                    "traefik.http.routers.monerod.tls.certresolver":
                      "monerosuite",
                    "traefik.http.services.monerod.loadbalancer.server.port":
                      "18089",
                  }
                : undefined,
            },
          },
        },
        "monerod-stagenet": {
          name: "Monero Stagenet Node",
          description:
            "Run a monerod stagenet node. Stagenet is a testing network for developers. It is a separate blockchain with separate coins from the main Monero network.",
          checked: isStagenetNode,
          required: false,
          architecture: [architectures.linuxAmd, architectures.linuxArm],
          bash: isStagenetNodePublic
            ? `
# Allow monerod p2p port and restricted rpc port
sudo ufw allow 38080/tcp 38089/tcp`
            : undefined,
          volumes: {
            "bitmonero-stagenet": {},
          },
          code: {
            "monerod-stagenet": {
              image: "ghcr.io/sethforprivacy/simple-monerod:latest",
              restart: "unless-stopped",
              container_name: "monerod-stagenet",
              volumes: ["bitmonero-stagenet:/home/monero"],
              ports: [
                ...(isStagenetNodePublic
                  ? ["38080:38080"]
                  : ["127.0.0.1:38080:38080"]),
                ...(isStagenetNodePublic
                  ? ["38089:38089"]
                  : ["127.0.0.1:38089:38089"]),
              ],
              command: [
                "--rpc-restricted-bind-ip=0.0.0.0",
                "--rpc-restricted-bind-port=38089",
                "--rpc-bind-ip=0.0.0.0",
                "--rpc-bind-port=38081",
                "--confirm-external-bind",
                "--enable-dns-blocklist",
                "--check-updates=disabled",
                "--no-igd",
                ...(moneroNodeNoLogs
                  ? ["--log-file=/dev/null"]
                  : ["--max-log-files=3", "--max-log-file-size=1048576"]),
                "--out-peers=32",
                "--limit-rate-down=1048576",
                ...(isStagenetNodePublic ? ["--public-node"] : []),
                "--stagenet",
              ],
              logging: !moneroNodeNoLogs ? undefined : { driver: "none" },
              healthcheck: {
                test: [
                  "CMD-SHELL",
                  "curl --fail http://localhost:38081/get_info || exit 1",
                ],
                interval: "30s",
                timeout: "5s",
                retries: 3,
              },
              labels: isTraefik
                ? {
                    "traefik.enable": "true",
                    "traefik.http.routers.monerod-stagenet.rule": `Host(\`${stagenetNodeDomain}\`)`,
                    "traefik.http.routers.monerod-stagenet.entrypoints":
                      "websecure",
                    "traefik.http.routers.monerod-stagenet.tls.certresolver":
                      "monerosuite",
                    "traefik.http.services.monerod-stagenet.loadbalancer.server.port":
                      "18089",
                  }
                : undefined,
            },
          },
        },
        p2pool: {
          name: "P2Pool",
          description:
            "P2Pool is a decentralized mining pool that works by creating a peer-to-peer network of miner nodes. For Monero's decentralization, it is better to use P2Pool instead of a centralized mining pool.",
          checked: p2PoolMode,
          required: false,
          architecture: [architectures.linuxAmd, architectures.linuxArm],
          volumes: {
            "p2pool-data": {},
          },
          bash:
            p2PoolMode === p2poolModes.mini
              ? `
# Allow p2pool mini p2p port
sudo ufw allow 37888/tcp
# Allow p2pool stratum port
sudo ufw allow 3333/tcp`
              : p2PoolMode === p2poolModes.full
              ? `
# Allow p2pool p2p port
sudo ufw allow 37889/tcp
# Allow p2pool stratum port
sudo ufw allow 3333/tcp`
              : undefined,
          code: {
            p2pool: {
              image: "ghcr.io/sethforprivacy/p2pool:latest",
              restart: "unless-stopped",
              container_name: "p2pool",
              tty: true,
              stdin_open: true,
              volumes: [
                "p2pool-data:/home/p2pool",
                "/dev/hugepages:/dev/hugepages:rw",
              ],
              ports: [
                "3333:3333",
                ...(p2PoolMode === p2poolModes.mini ? ["37888:37888"] : []),
                ...(p2PoolMode === p2poolModes.full ? ["37889:37889"] : []),
              ],
              command: [
                `--wallet ${p2PoolPayoutAddress}`,
                "--stratum 0.0.0.0:3333",
                `--p2p 0.0.0.0:${
                  p2PoolMode === p2poolModes.mini ? "37888" : "37889"
                }`,
                "--rpc-port 18089",
                "--zmq-port 18084",
                "--host monerod",
                ...(p2PoolMode === p2poolModes.mini
                  ? ["--addpeers node.portemonero.com:37888", "--mini"]
                  : p2PoolMode === p2poolModes.full
                  ? [
                      "--addpeers 65.21.227.114:37889,node.sethforprivacy.com:37889",
                    ]
                  : []),
                ...(miningMode === minigModes.p2pool
                  ? [`--start-mining ${p2PoolMiningThreads}`]
                  : []),
                ...(torProxyMode === torProxyModes.full
                  ? ["--socks5 127.0.0.1:9150"]
                  : []),
              ].join(" "),
            },
          },
        },
        "monero-wallet-rpc": {
          name: "Monero Wallet RPC",
          description:
            "Monero Wallet RPC is a remote procedure call interface for Monero wallet.",
          checked: isMoneroWalletRpc,
          required: false,
          architecture: [architectures.linuxAmd, architectures.linuxArm],
          code: {
            "monero-wallet-rpc": {
              image: "sethsimmons/simple-monero-wallet-rpc:latest",
              restart: "unless-stopped",
              container_name: "monero-wallet-rpc",
              ports: ["127.0.0.1:18083:18083"],
              volumes: ["monero-wallet-rpc-data:/home/monero"],
              command: [
                "--daemon-address=monerod:18089",
                "--trusted-daemon",
                "--rpc-bind-port=18083",
                "--wallet-dir /home/monero",
              ],
            },
          },
          volumes: {
            "monero-wallet-rpc-data": {},
          },
        },
        moneroblock: {
          name: "Moneroblock",
          description:
            "Moneroblock is a self-hostable block explorer for monero",
          checked: isMoneroblock,
          required: false,
          architecture: [architectures.linuxAmd, architectures.linuxArm],
          code: {
            moneroblock: {
              image: "sethsimmons/moneroblock:latest",
              restart: "unless-stopped",
              container_name: "moneroblock",
              ports: ["127.0.0.1:31312:31312"],
              command: ["--daemon", "monerod:18089"],
              labels: isTraefik
                ? {
                    "traefik.enable": "true",
                    "traefik.http.routers.moneroblock.rule": `Host(\`${moneroBlockDomain}\`)`,
                    "traefik.http.routers.moneroblock.entrypoints": "websecure",
                    "traefik.http.routers.moneroblock.tls.certresolver":
                      "monerosuite",
                    "traefik.http.services.moneroblock.loadbalancer.server.port":
                      "31312",
                  }
                : undefined,
              logging: !isMoneroblockLogging
                ? {
                    driver: "none",
                  }
                : undefined,
            },
          },
        },
        "onion-monero-blockchain-explorer": {
          name: "Onion Monero Blockchain Explorer",
          description:
            "Onion Monero Blockchain Explorer allows you to browse Monero blockchain. It uses no JavaScript, no cookies and no trackers.",
          checked: isOnionMoneroBlockchainExplorer,
          required: false,
          architecture: [architectures.linuxAmd],
          code: {
            onionMoneroBlockchainExplorer: {
              image: "vdo1138/xmrblocks:latest",
              restart: "unless-stopped",
              container_name: "onion-monero-blockchain-explorer",
              ports: ["127.0.0.1:8081:8081"],
              volumes: ["bitmonero:/home/monero/.bitmonero"],
              depends_on: ["monerod"],
              command: [
                "./xmrblocks --enable-json-api --enable-autorefresh-option --enable-emission-monitor --daemon-url=monerod:18089 --enable-pusher",
              ],
              labels: isTraefik
                ? {
                    "traefik.enable": "true",
                    "traefik.http.routers.onion-monero-blockchain-explorer.rule": `Host(\`${onionMoneroBlockchainExplorerDomain}\`)`,
                    "traefik.http.routers.onion-monero-blockchain-explorer.entrypoints":
                      "websecure",
                    "traefik.http.routers.onion-monero-blockchain-explorer.tls.certresolver":
                      "monerosuite",
                    "traefik.http.services.onion-monero-blockchain-explorer.loadbalancer.server.port":
                      "8081",
                  }
                : undefined,
            },
          },
        },
        "tor-proxy": {
          name: "Tor Proxy",
          description:
            "Tor Proxy is a proxy server that forwards traffic into the Tor network.",
          checked: torProxyMode !== torProxyModes.none,
          required: false,
          architecture: [architectures.linuxAmd],
          code: {
            "tor-proxy": {
              image: "ghcr.io/peterdavehello/tor-socks-proxy:latest",
              container_name: "tor-proxy",
              restart: "unless-stopped",
              ports: ["127.0.0.1:9150:9150"],
            },
          },
        },
        "tor-hidden-service": {
          name: "Tor Hidden Service",
          description:
            "Your own private Tor network for Monero and services like Moneroblock and P2Pool. You can share it with others or keep it to yourself.",
          checked: isHiddenServices,
          required: false,
          architecture: [architectures.linuxAmd],
          volumes: {
            "tor-keys": {},
          },
          code: {
            "tor-hidden-service": {
              image: "goldy/tor-hidden-service:latest",
              container_name: "tor-hidden-service",
              restart: "unless-stopped",
              links: [
                "monerod",
                ...(isStagenetNode ? ["monerod-stagenet"] : []),
                ...(p2PoolMode !== p2poolModes.none ? ["p2pool"] : []),
                ...(isMoneroblock ? ["moneroblock"] : []),
                ...(isOnionMoneroBlockchainExplorer
                  ? ["onion-monero-blockchain-explorer"]
                  : []),
                ...(isMonitoring ? ["grafana"] : []),
              ],
              environment: {
                MONEROD_TOR_SERVICE_HOSTS: "18089:monerod:18089",
                ...(isStagenetNode
                  ? {
                      MONEROD_STAGENET_TOR_SERVICE_HOSTS:
                        "38089:monerod-stagenet:38089",
                    }
                  : {}),
                ...(p2PoolMode !== p2poolModes.none
                  ? {
                      P2POOL_TOR_SERVICE_HOSTS: "3333:p2pool:3333",
                    }
                  : {}),
                ...(isMoneroblock
                  ? {
                      MONEROBLOCK_TOR_SERVICE_HOSTS: "80:moneroblock:31312",
                    }
                  : {}),
                ...(isOnionMoneroBlockchainExplorer
                  ? {
                      MONERO_ONION_BLOCKCHAIN_EXPLORER_TOR_SERVICE_HOSTS:
                        "80:onion-monero-blockchain-explorer:8081",
                    }
                  : {}),
                ...(isMonitoring
                  ? { GRAFANA_TOR_SERVICE_HOSTS: "80:grafana:3000" }
                  : {}),
              },
              volumes: ["tor-keys:/var/lib/tor/hidden_service/"],
            },
          },
        },
        watchtower: {
          name: "Watchtower",
          description:
            "Watchtower is a service that monitors running Docker and watches for newer images. If there is a new version available, watchtower will automatically restart the container with the newest image.",
          checked: isWatchtower,
          required: false,
          architecture: [architectures.linuxAmd, architectures.linuxArm],
          code: {
            watchtower: {
              image: "containrrr/watchtower:latest",
              container_name: "watchtower",
              restart: "unless-stopped",
              environment: {
                WATCHTOWER_CLEANUP: true,
                WATCHTOWER_POLL_INTERVAL: 3600,
              },
              volumes: ["/var/run/docker.sock:/var/run/docker.sock"],
            },
          },
        },
        monitoring: {
          name: "Monitoring",
          description:
            "Monitoring with Prometheus and Grafana: see your node stats visualized in graphs. See on a map where your peers are located.",
          checked: isMonitoring,
          required: false,
          architecture: [architectures.linuxAmd],
          volumes: {
            grafana: {},
            prometheus: {},
          },
          bash: `
# Download default Prometheus and Grafana configs/dashboards
# Execute line by line
mkdir -p monitoring/grafana/dashboards monitoring/grafana/provisioning/{dashboards,datasources} monitoring/prometheus 
wget -O monitoring/prometheus/config.yaml https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/prometheus/config.yaml
wget -O monitoring/grafana/grafana.ini https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/grafana.ini
wget -O monitoring/grafana/dashboards/node_stats.json https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/dashboards/node_stats.json
wget -O monitoring/grafana/provisioning/dashboards/all.yaml https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/provisioning/dashboards/all.yaml
wget -O monitoring/grafana/provisioning/datasources/all.yaml https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/provisioning/datasources/all.yaml

# Customize the Monitoring deployment with environment variables
touch .env
echo P2P_PORT=18080 >> .env
echo RESTRICTED_PORT=18089 >> .env
echo ZMQ_PORT=18084 >> .env
echo UNRESTRICTED_PORT=18081 >> .env
echo GF_USERS_ALLOW_SIGN_UP=false >> .env
echo GF_USERS_ALLOW_ORG_CREATE=false >> .env
echo GF_AUTH_ANONYMOUS_ENABLED=true >> .env
echo GF_AUTH_BASIC_ENABLED=false >> .env
echo GF_AUTH_DISABLE_LOGIN_FORM=true >> .env
echo GF_SECURITY_ADMIN_PASSWORD=admin >> .env
echo GF_SECURITY_ADMIN_USER=admin >> .env`,
          code: {
            prometheus: {
              image: "prom/prometheus:latest",
              container_name: "prometheus",
              restart: "unless-stopped",
              command: [
                "--config.file=/etc/prometheus/config.yaml",
                "--storage.tsdb.path=/prometheus",
                "--storage.tsdb.retention.time=${PROM_RETENTION:-360d}",
              ],
              volumes: [
                "prometheus:/prometheus",
                "./monitoring/prometheus/config.yaml:/etc/prometheus/config.yaml:ro",
              ],
            },
            exporter: {
              image: "lalanza808/monerod_exporter:latest",
              container_name: "monerod_exporter",
              restart: "unless-stopped",
              command: "--monero-addr=http://monerod:18081",
            },
            nodemapper: {
              image: "lalanza808/nodemapper:latest",
              container_name: "nodemapper",
              restart: "unless-stopped",
              environment: {
                NODE_HOST: "monerod",
                NODE_PORT: "18081",
              },
            },
            grafana: {
              image: "grafana/grafana:latest",
              container_name: "grafana",
              user: "${UID:-1000}:${GID:-1000}",
              command: "-config=/etc/grafana/grafana.ini",
              restart: "unless-stopped",
              ports: ["127.0.0.1:${GF_PORT:-3000}:3000"],
              volumes: [
                "grafana:/var/lib/grafana",
                "./monitoring/grafana/grafana.ini:/etc/grafana/grafana.ini:ro",
                "./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro",
                "./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro",
              ],
              labels: isTraefik
                ? {
                    "traefik.enable": "true",
                    "traefik.http.routers.monitoring.rule": `Host(\`${grafanaDomain}\`)`,
                    "traefik.http.routers.monitoring.entrypoints": "websecure",
                    "traefik.http.routers.monitoring.tls.certresolver":
                      "monerosuite",
                    "traefik.http.services.monitoring.loadbalancer.server.port":
                      "31312",
                  }
                : undefined,
              environment: {
                HOSTNAME: "grafana",
                GF_SERVER_ROOT_URL: isTraefik
                  ? `https://${grafanaDomain}`
                  : `http://${grafanaDomain}`,
                GF_ANALYTICS_REPORTING_ENABLED: "false",
                GF_ANALYTICS_CHECK_FOR_UPDATES: "false",
                GF_LOG_LEVEL: "${GF_LOG_LEVEL:-error}",
                GF_USERS_ALLOW_SIGN_UP: "${GF_USERS_ALLOW_SIGN_UP:-false}",
                GF_USERS_ALLOW_ORG_CREATE:
                  "${GF_USERS_ALLOW_ORG_CREATE:-false}",
                GF_AUTH_ANONYMOUS_ENABLED: "${GF_AUTH_ANONYMOUS_ENABLED:-true}",
                GF_AUTH_BASIC_ENABLED: "${GF_AUTH_BASIC_ENABLED:-false}",
                GF_AUTH_DISABLE_LOGIN_FORM:
                  "${GF_AUTH_DISABLE_LOGIN_FORM:-true}",
                GF_SECURITY_ADMIN_PASSWORD:
                  "${GF_SECURITY_ADMIN_PASSWORD:-admin}",
                GF_SECURITY_ADMIN_USER: "${GF_SECURITY_ADMIN_USER:-admin}",
              },
            },
          },
        },
        autoheal: {
          name: "Autoheal",
          description:
            "Autoheal is a simple Docker container that will monitor and restart unhealthy docker containers.",
          checked: isAutoheal,
          required: false,
          architecture: [architectures.linuxAmd, architectures.linuxArm],
          code: {
            autoheal: {
              image: "willfarrell/autoheal:latest",
              container_name: "autoheal",
              restart: "unless-stopped",
              environment: {
                AUTOHEAL_CONTAINER_LABEL: "all",
              },
              volumes: ["/var/run/docker.sock:/var/run/docker.sock"],
            },
          },
        },
        xmrig: {
          name: "XMRig",
          description:
            "XMRig is a high performance miner for Monero / RandomX. It supports both CPU and GPU mining, but this service is only meant to run on CPU.",
          checked: miningMode === minigModes.xmrig,
          required: false,
          architecture: [architectures.linuxAmd],
          code: {
            xmrig: {
              image: "metal3d/xmrig:latest",
              container_name: "xmrig",
              restart: "unless-stopped",
              cap_add: ["SYS_ADMIN", "SYS_RAWIO"],
              devices: ["/dev/cpu", "/dev/mem"],
              volumes: ["/lib/modules:/lib/modules"],
              environment: {
                POOL_URL: "p2pool:3333",
                POOL_USER: "xmrig",
                POOL_PASS: "",
                DONATE_LEVEL: xmrigDonateLevel,
              },
            },
          },
        },
        traefik: {
          name: "Traefik",
          description:
            "Traefik is a modern HTTP reverse proxy and load balancer that makes deploying microservices easy.",
          checked: isTraefik,
          required: false,
          architecture: [architectures.linuxAmd, architectures.linuxArm],
          volumes: {
            letsencrypt: {},
          },
          code: {
            traefik: {
              image: "traefik:latest",
              container_name: "traefik",
              restart: "unless-stopped",
              command: [
                "--providers.docker=true",
                "--providers.docker.exposedbydefault=false",
                "--entrypoints.web.address=:80",
                "--entrypoints.websecure.address=:443",
                "--entrypoints.web.http.redirections.entrypoint.to=websecure",
                "--entrypoints.web.http.redirections.entrypoint.scheme=https",
                "--certificatesresolvers.monerosuite.acme.tlschallenge=true",
                "--certificatesresolvers.monerosuite.acme.storage=/letsencrypt/acme.json",
              ],
              ports: ["80:80", "443:443"],
              volumes: [
                "/var/run/docker.sock:/var/run/docker.sock",
                "letsencrypt:/letsencrypt",
              ],
            },
          },
          bash: "\n# Allow http and https ports\nsudo ufw allow 80/tcp 443/tcp\n",
        },
      } as ServiceMap),
    [
      isMoneroPublicNode,
      moneroNodeNoLogs,
      p2PoolMode,
      isPrunedNode,
      isSyncPrunedBlocks,
      isHiddenServices,
      torProxyMode,
      isTraefik,
      moneroNodeDomain,
      isStagenetNode,
      isStagenetNodePublic,
      stagenetNodeDomain,
      p2PoolPayoutAddress,
      p2PoolMiningThreads,
      isMoneroWalletRpc,
      isMoneroblock,
      moneroBlockDomain,
      isMoneroblockLogging,
      isOnionMoneroBlockchainExplorer,
      onionMoneroBlockchainExplorerDomain,
      isMonitoring,
      isWatchtower,
      grafanaDomain,
      isAutoheal,
      miningMode,
      xmrigDonateLevel,
    ]
  );

  const filteredServices = useMemo<ServiceMap>(
    () =>
      Object.fromEntries(
        Object.entries(services).filter(([, service]) =>
          service.architecture?.includes(architecture)
        )
      ),
    [architecture, services]
  );

  return {
    services: filteredServices,
    stateFunctions: {
      architecture,
      setArchitecture,
      isMoneroPublicNode,
      setIsMoneroPublicNode,
      isPrunedNode,
      setIsPrunedNode,
      isSyncPrunedBlocks,
      setIsSyncPrunedBlocks,
      moneroNodeNoLogs,
      setMoneroNodeNoLogs,
      isStagenetNode,
      setIsStagenetNode,
      isStagenetNodePublic,
      setIsStagenetNodePublic,
      stagenetNodeDomain,
      setStagenetNodeDomain,
      isMoneroWalletRpc,
      setIsMoneroWalletRpc,
      p2PoolMode,
      setP2PoolMode,
      p2PoolPayoutAddress,
      setP2PoolPayoutAddress,
      miningMode,
      setMiningMode,
      p2PoolMiningThreads,
      setP2PoolMiningThreads,
      isMoneroblock,
      setIsMoneroblock,
      isMoneroblockLogging,
      setIsMoneroblockLogging,
      isOnionMoneroBlockchainExplorer,
      setIsOnionMoneroBlockchainExplorer,
      torProxyMode,
      setTorProxyMode,
      isHiddenServices,
      setIsHiddenServices,
      isWatchtower,
      setIsWatchtower,
      isMonitoring,
      setIsMonitoring,
      grafanaDomain,
      setGrafanaDomain,
      isAutoheal,
      setIsAutoheal,
      isTraefik,
      setIsTraefik,
      moneroNodeDomain,
      setMoneroNodeDomain,
      moneroBlockDomain,
      setMoneroBlockDomain,
      onionMoneroBlockchainExplorerDomain,
      setOnionMoneroBlockchainExplorerDomain,
    },
  };
};
