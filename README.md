# Monero Suite
<p align="center">
  <img align="center" src="public/monero-suite-logo-transparent-small.png" alt="...">
</p>

This project lets you run a Monero node and multiple services that relate to Monero in Docker containers. It also includes a Tor proxy and hidden services for anonymity and Watchtower for auto-updating the containers. It lets you monitor the health of you Monero node and you can configure a reverse proxy to make the services reachable from the internet with a domain name you own.

## Features

- [monerod](https://getmonero.org) (the Monero daemon)
- [monero-wallet-rpc](https://web.getmonero.org/resources/developer-guides/wallet-rpc.html) (the Monero wallet RPC - control a wallet with code)
- [P2Pool](https://github.com/SChernykh/p2pool) (a decentralized mining pool for Monero)
- [XMRig](https://xmrig.com/) (an efficient Monero CPU miner - runs on the P2Pool node)
- [Traefik](https://traefik.io) (a reverse proxy for other services, so they can be reached via a domain name you own)
- [MoneroBlock](https://github.com/duggavo/MoneroBlock) (a Monero block explorer)
- [Monitoring](https://github.com/lalanza808/docker-monero-node) (a monitoring stack with Prometheus, Grafana, and monerod-exporter. It serves a beautiful dashboard with all stats of your node. And it even has a map with all nodes that are connected to your node.)
- [Tor Proxy and Tor Hidden Services](https://github.com/hundehausen/tor-hidden-service-docker) (anonymity network for monerod, P2Pool and other services)
- [Docker Autoheal](https://github.com/willfarrell/docker-autoheal) (auto-restart unhealthy containers)
- [Watchtower](https://github.com/containrrr/watchtower) (auto-update containers)
- [Portainer](https://github.com/portainer/portainer) (manage your docker services with a GUI in your browser)
- [Cuprate](https://github.com/cuprate/cuprate) (an alternative Monero node implementation written in Rust) EXPERIMENTAL

Disclaimer: This project is not affiliated with, endorsed by, or sponsored by the Monero Project.

## Quick Start (for Debian based systems) BETA

Still in Beta, use at your own risk.

1. On the left side, select the service you want and configure them
2. Generate a bash command with your installation script
3. Verify the script via the preview button
4. Copy that command and paste it into your terminal

Et voilà: Docker is installed and then all services will be started in the background.

Generated configs get deleted after 24 - 48 hours.

Pentested by [Unkn8wn69](https://github.com/Unkn8wn69)

## Manual Installation (for all systems)
You need to have [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed. It could also work with Podman, but I haven't tested it.

Go to [monersuite.org](https://monerosuite.org/)

Save the generated docker-compose.yml file to a directory and run the following command in that directory:
``` 
UID="$(id -u)" GID="$(id -g)" docker compose up -d
```
It will take some time to download the images and start the containers. You can check the status of the containers with:
```
docker compose ps
```
or a more interactive view with [Portainer](https://www.portainer.io) which is available in Monero Suite or [LazyDocker](https://github.com/jesseduffield/lazydocker) which is a CLI tool.

If you are looking for the urls of the hidden services that were generated when starting the tor container for the first time, you can find them in the container logs:
```
docker compose logs tor
```

## Roadmap
no particular order

- add merchant software. Maybe BTCPayServer, [MoneroPay](https://github.com/moneropay/moneropay), [HotShop](https://github.com/CryptoGrampy/HotShop)
- add [Monero Light Wallet Server](https://github.com/vtnerd/monero-lws)
- add [Onion Monero Blockchain Explorer](https://github.com/moneroexamples/onion-monero-blockchain-explorer) (a Monero block explorer without JavaScript)
- add [nerostr](https://github.com/pluja/nerostr) (a nostr monero-paid relay)
- full monerod.conf generator with explanations
- support installation script for more linux based operating systems