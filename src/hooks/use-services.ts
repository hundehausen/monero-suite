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
  code: PropertiesServices;
  bash?: string;
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
                ...(p2PoolMode !== "none" ? ["18083:18083"] : []),
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
                  ? ["--zmq-pub=tcp://0.0.0.0:18083"]
                  : []),
              ],
            },
          },
        },
        p2pool: {
          name: "P2Pool",
          description:
            "P2Pool is a decentralized mining pool that works by creating a peer-to-peer network of miner nodes.",
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
              ports: ["31312:31312"],
              command: ["--daemon", "monerod:18089"],
            },
          },
        },
        tor: {
          name: "Tor",
          description:
            "Tor is free and open-source software for enabling anonymous communication.",
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
              links: ["monerod", ...(p2PoolMode !== "none" ? ["p2pool"] : [])],
              environment: {
                MONEROD_TOR_SERVICE_HOSTS: "18089:monerod:18089",
                MONEROD_TOR_SERVICE_VERSION: "3",
                ...(p2PoolMode !== "none"
                  ? {
                      P2POOL_TOR_SERVICE_HOSTS: "3333:p2pool:3333",
                      P2POOL_TOR_SERVICE_VERSION: "3",
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
            "Watchtower is a service that monitors running Docker containers and watches for changes to the images that those containers were originally started from. If watchtower detects that an image has changed, it will automatically restart the container using the new image.",
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
          checked: false,
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
      isMoneroblock,
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
      p2PoolMode,
      setP2PoolMode,
      isTor,
      setIsTor,
      isWatchtower,
      setIsWatchtower,
      isMoneroblock,
      setIsMoneroblock,
      isAutoheal,
      setIsAutoheal,
      p2PoolPayoutAddress,
      setP2PoolPayoutAddress,
      p2PoolMiningThreads,
      setP2PoolMiningThreads,
      isPrunedNode,
      setIsPrunedNode,
    },
  };
};
