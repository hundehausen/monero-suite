import { useMemo, useState } from "react";
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
}

export interface ServiceMap {
  [key: string]: Service;
}

export const useServices = () => {
  const [isMoneroPublicNode, setIsMoneroPublicNode] = useState(true);
  const [isPrunedNode, setIsPrunedNode] = useState(true);
  const [p2PoolMode, setP2PoolMode] = useState("none");
  const [p2PoolPayoutAddress, setP2PoolPayoutAddress] = useState(
    "48oc8c65B9JPv6FBZBg7UN9xUYmxux6WfEh61WBoKca7Amh7r7bnCZ7JJicLw7UN3DEgEADwqrhwxGBJazPZ14PJGbmMyXX"
  );
  const [p2PoolMiningThreads, setP2PoolMiningThreads] = useState(0);
  const [isTor, setIsTor] = useState(false);
  const [isWatchtower, setIsWatchtower] = useState(false);
  const [isMoneroblock, setIsMoneroblock] = useState(false);
  const [isOnionMoneroBlockchainExplorer, setIsOnionMoneroBlockchainExplorer] =
    useState(false);
  const [isAutoheal, setIsAutoheal] = useState(false);
  const [isXmrig, setIsXmrig] = useState(false);

  const services = useMemo<ServiceMap>(
    () =>
      ({
        monerod: {
          name: "Monero Node",
          description:
            "The Monero daemon, monerod, is the core software that runs the Monero network. It is responsible for storing the blockchain and synchronizing transactions.",
          checked: true,
          required: true,
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
              image: "sethsimmons/simple-monerod:latest",
              restart: "unless-stopped",
              container_name: "monerod",
              volumes: ["bitmonero:/home/monero"],
              ports: [
                "18080:18080",
                ...(p2PoolMode !== "none" ? ["18084:18084"] : []),
                "18089:18089",
              ],
              command: [
                "--rpc-restricted-bind-ip=0.0.0.0",
                "--rpc-restricted-bind-port=18089",
                "--enable-dns-blocklist",
                "--no-igd",
                "--out-peers=50",
                ...(isPrunedNode ? ["--prune-blockchain"] : []),
                ...(isMoneroPublicNode ? ["--public-node"] : []),
                ...(p2PoolMode !== "none"
                  ? ["--zmq-pub=tcp://0.0.0.0:18084"]
                  : []),
              ],
            },
          },
        },
        p2pool: {
          name: "P2Pool",
          description:
            "P2Pool is a decentralized mining pool that works by creating a peer-to-peer network of miner nodes. For Moneros decentralization it is better to use P2Pool, instead of a centralized mining pool.",
          checked: p2PoolMode,
          required: false,
          volumes: {
            "p2pool-data": {},
          },
          bash:
            p2PoolMode === "mini"
              ? `
# Allow p2pool mini p2p port
sudo ufw allow 37888/tcp
# Allow p2pool stratum port
sudo ufw allow 3333/tcp`
              : p2PoolMode === "full"
              ? `
# Allow p2pool p2p port
sudo ufw allow 37889/tcp
# Allow p2pool stratum port
sudo ufw allow 3333/tcp`
              : undefined,
          code: {
            p2pool: {
              image: "sethsimmons/p2pool:latest",
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
                ...(p2PoolMode === "mini" ? ["37888:37888"] : []),
                ...(p2PoolMode === "full" ? ["37889:37889"] : []),
              ],
              command: [
                `--wallet ${p2PoolPayoutAddress}`,
                "--stratum 0.0.0.0:3333",
                `--p2p 0.0.0.0:${p2PoolMode === "mini" ? "37888" : "37889"}`,
                "--rpc-port 18089",
                "--host monerod",
                ...(p2PoolMode === "mini"
                  ? ["--addpeers node.portemonero.com:37888", "--mini"]
                  : p2PoolMode === "full"
                  ? [
                      "--addpeers 65.21.227.114:37889,node.sethforprivacy.com:37889",
                    ]
                  : []),
                ...(p2PoolMiningThreads > 0
                  ? [`--start-mining ${p2PoolMiningThreads}`]
                  : []),
              ].join(" "),
            },
          },
        },
        moneroblock: {
          name: "Moneroblock",
          description:
            "Moneroblock is a self-hostable block explorer for monero",
          checked: isMoneroblock,
          required: false,
          code: {
            moneroblock: {
              image: "sethsimmons/moneroblock:latest",
              restart: "unless-stopped",
              container_name: "moneroblock",
              ports: ["127.0.0.1:31312:31312"],
              command: ["--daemon", "monerod:18089"],
            },
          },
        },
        onionMoneroBlockchainExplorer: {
          name: "Onion Monero Blockchain Explorer",
          description:
            "Onion Monero Blockchain Explorer allows you to browse Monero blockchain. It uses no JavaScript, no cookies and no trackers.",
          checked: isOnionMoneroBlockchainExplorer,
          required: false,
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
            },
          },
        },
        tor: {
          name: "Tor",
          description:
            "Your own private Tor network for Monero and services like Moneroblock and P2Pool. You can share it with others or keep it to yourself.",
          checked: isTor,
          required: false,
          volumes: {
            "tor-keys": {},
          },
          code: {
            tor: {
              image: "goldy/tor-hidden-service:latest",
              container_name: "tor",
              restart: "unless-stopped",
              links: [
                "monerod",
                ...(p2PoolMode !== "none" ? ["p2pool"] : []),
                ...(isMoneroblock ? ["moneroblock"] : []),
              ],
              environment: {
                MONEROD_TOR_SERVICE_HOSTS: "18089:monerod:18089",
                ...(p2PoolMode !== "none"
                  ? {
                      P2POOL_TOR_SERVICE_HOSTS: "3333:p2pool:3333",
                    }
                  : {}),
                ...(isMoneroblock
                  ? {
                      MONEROBLOCK_TOR_SERVICE_HOSTS: "31312:moneroblock:31312",
                    }
                  : {}),
                ...(isOnionMoneroBlockchainExplorer
                  ? {
                      MONERO_ONION_BLOCKCHAIN_EXPLORER_TOR_SERVICE_HOSTS:
                        "8081:onion-monero-blockchain-explorer:8081",
                    }
                  : {}),
              },
              volumes: ["tor-keys:/var/lib/tor/hidden_service/"],
            },
          },
        },
        watchtower: {
          name: "Watchtower",
          description:
            "Watchtower is a service that monitors running Docker and watches for newer images. If there is a new version available, watchtower will autoamtically restart the container with the newest image.",
          checked: isWatchtower,
          required: false,
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
        autoheal: {
          name: "Autoheal",
          description:
            "Autoheal is a simple Docker container that will monitor and restart unhealthy docker containers.",
          checked: isAutoheal,
          required: false,
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
            "XMRig is a high performance Monero (XMR) CPU miner, with official support for Windows.",
          checked: isXmrig,
          required: false,
          code: {
            xmrig: {
              image: "minerboy/xmrig:latest",
              container_name: "xmrig",
              restart: "unless-stopped",
              cap_add: ["SYS_ADMIN", "SYS_RAWIO"],
              devices: ["/dev/cpu", "/dev/mem"],
              volumes: ["/lib/modules:/lib/modules"],
              command: ["-o p2pool:3333"],
            },
          },
        },
      } as ServiceMap),
    [
      isMoneroPublicNode,
      isPrunedNode,
      p2PoolMode,
      p2PoolPayoutAddress,
      p2PoolMiningThreads,
      isXmrig,
      isMoneroblock,
      isOnionMoneroBlockchainExplorer,
      isTor,
      isWatchtower,
      isAutoheal,
    ]
  );

  return {
    services,
    stateFunctions: {
      isMoneroPublicNode,
      setIsMoneroPublicNode,
      isPrunedNode,
      setIsPrunedNode,
      p2PoolMode,
      setP2PoolMode,
      p2PoolPayoutAddress,
      setP2PoolPayoutAddress,
      p2PoolMiningThreads,
      setP2PoolMiningThreads,
      isXmrig,
      setIsXmrig,
      isMoneroblock,
      setIsMoneroblock,
      isOnionMoneroBlockchainExplorer,
      setIsOnionMoneroBlockchainExplorer,
      isTor,
      setIsTor,
      isWatchtower,
      setIsWatchtower,
      isAutoheal,
      setIsAutoheal,
    },
  };
};
