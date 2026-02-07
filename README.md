<p align="center">
  <img src="public/monero-suite-logo-transparent-small.png" alt="Monero Suite logo">
</p>

<h1 align="center">Monero Suite</h1>

<p align="center">
  A web-based configuration generator for running Monero services in Docker.<br>
  Pick your services, tweak the settings, and get a ready-to-use <code>docker-compose.yml</code>.
</p>

<p align="center">
  <a href="https://monerosuite.org">monerosuite.org</a>
</p>

---

## What It Does

Monero Suite generates Docker Compose configurations for a full Monero stack. You configure everything through an interactive UI — no manual YAML editing required.

The generated setup can include a Monero node, decentralized mining, monitoring, a reverse proxy with your own domain, Tor hidden services, and more.

## Services

| Service | Description |
|---------|-------------|
| [monerod](https://getmonero.org) | The Monero daemon — syncs and validates the blockchain |
| [Cuprate](https://github.com/cuprate/cuprate) | Alternative Monero node written in Rust (experimental) |
| [monero-wallet-rpc](https://web.getmonero.org/resources/developer-guides/wallet-rpc.html) | Control a Monero wallet programmatically |
| [P2Pool](https://github.com/SChernykh/p2pool) | Decentralized mining pool (nano, mini, and full sidechains) |
| [XMRig](https://xmrig.com/) | High-performance CPU miner, connected to your P2Pool node |
| [MoneroBlock](https://github.com/duggavo/MoneroBlock) | Lightweight Monero block explorer |
| [Monitoring](https://github.com/lalanza808/docker-monero-node) | Grafana + Prometheus dashboard with node stats and peer map |
| [Tor](https://github.com/hundehausen/tor-hidden-service-docker) | Proxy for anonymous transactions and hidden services for private access |
| [Traefik](https://traefik.io) | Reverse proxy — expose services via your own domain with TLS |
| [Portainer](https://github.com/portainer/portainer) | Web-based Docker management UI |
| [Watchtower](https://github.com/nicholas-fedor/watchtower) | Automatically updates running containers |
| [Autoheal](https://github.com/willfarrell/docker-autoheal) | Automatically restarts unhealthy containers |

## Quick Start (Debian-based systems)

> Still in beta. Use at your own risk.

1. Go to [monerosuite.org](https://monerosuite.org)
2. Select and configure the services you want
3. Click **Generate Install Script** and verify it via the preview button
4. Copy the generated command and paste it into your terminal

This installs Docker (if needed) and starts all selected services in the background. Generated configs are automatically deleted after 24–48 hours.

## Manual Installation

Requirements: [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) (Podman may work but is untested).

1. Go to [monerosuite.org](https://monerosuite.org) and configure your services
2. Download the generated `docker-compose.yml`
3. Run it:

```bash
UID="$(id -u)" GID="$(id -g)" docker compose up -d
```

Check container status:

```bash
docker compose ps
```

To find your Tor hidden service addresses after the first run:

```bash
docker compose logs tor
```

## Roadmap

- Merchant software ([MoneroPay](https://github.com/moneropay/moneropay), [HotShop](https://github.com/CryptoGrampy/HotShop))
- [Monero Light Wallet Server](https://github.com/vtnerd/monero-lws)
- [Onion Monero Blockchain Explorer](https://github.com/moneroexamples/onion-monero-blockchain-explorer) (JavaScript-free block explorer)
- [nerostr](https://github.com/pluja/nerostr) (Monero-paid Nostr relay)
- Broader Linux distribution support for the install script

## Security

Pentested by [Unkn8wn69](https://github.com/Unkn8wn69).

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by the Monero Project.
