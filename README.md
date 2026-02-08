<p align="center">
  <img src="public/monero-suite-logo-transparent-small.png" alt="Monero Suite logo">
</p>

<h1 align="center">Monero Suite</h1>

<p align="center">
  Run your own Monero infrastructure in minutes.<br>
  Pick services, configure them, and get a self-contained install script — no YAML editing, no guesswork. And everything is running in Docker, so you can deploy anywhere.
</p>

<p align="center">
  <a href="https://monerosuite.org"><strong>monerosuite.org</strong></a>
</p>

---

## Why Monero Suite?

Running a Monero node should be accessible to everyone, not just sysadmins. Monero Suite gives you a web UI to configure a full Monero stack — node, mining, monitoring, Tor, reverse proxy — and generates a single `docker-compose.yml` you can deploy anywhere.

**You see everything before it runs.** Every Docker image, every config file, every shell command is shown in full before you execute anything. No hidden network calls, no telemetry, no black boxes. The generated install script is fully self-contained — it embeds your `docker-compose.yml` and `.env` inline and makes zero callbacks to our servers at runtime.

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

## Quick Start

Supported distros: Ubuntu, Debian, Fedora, CentOS Stream, Rocky Linux, AlmaLinux, RHEL.

1. Go to [monerosuite.org](https://monerosuite.org)
2. Select and configure the services you want
3. Click **Generate Install Script** — review the full script via the preview button
4. Copy the generated command and run it on your server

The script installs Docker (if needed), configures your firewall, and starts all selected services. Generated configs are automatically deleted from our servers within 24 hours.

## Manual Installation

If you prefer to handle Docker yourself:

1. Go to [monerosuite.org](https://monerosuite.org) and configure your services
2. Download the generated `docker-compose.yml` (and `.env` if applicable)
3. Run it:

```bash
UID="$(id -u)" GID="$(id -g)" docker compose up -d
```

Check container status:

```bash
docker compose ps
```

Find your Tor hidden service addresses:

```bash
docker compose logs tor
```

Requirements: [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/).

## Security

Monero Suite is designed with the assumption that you should never blindly trust remote code — even ours.

### Transparency by design

- **Full script preview.** The entire install script is rendered in the browser before you run anything. Every shell command, every Docker image, every config line is visible and reviewable.
- **Self-contained scripts.** Generated install scripts embed `docker-compose.yml` and `.env` as inline heredocs. Once generated, the script makes zero network calls back to Monero Suite — it runs entirely offline.
- **Temporary storage only.** Uploaded configs are stored in Vercel Blob and automatically deleted within 24 hours via an authenticated cron job. Config IDs are random and non-sequential.
- **Open source.** The entire codebase is public. You can audit every line, build it yourself, or fork it.

### Server-side hardening

All user-generated content is validated server-side before upload:

- **Input size limits** — Docker Compose YAML (64 KB), env content (8 KB), firewall ports (512 bytes)
- **Server-side bash generation** — Bash setup commands (package installs, config file downloads) are never accepted from the client. The frontend sends only boolean flags indicating which services are enabled, and all bash content is generated server-side from hardcoded constants. This eliminates command injection as an attack vector.
- **Heredoc injection prevention** — Inputs containing heredoc delimiters are rejected, preventing shell escape attacks in the generated script.
- **Firewall port validation** — Strict regex enforcement (`port/protocol` format only)
- **Fetch safety** — Script retrieval enforces a 10-second timeout and 1 MB size limit with proper abort handling.

### Install script safety

The generated bash script includes several runtime protections:

- **Privilege checks** — Verifies root or sudo access before modifying the system
- **OS detection** — Identifies the distro and exits cleanly on unsupported systems
- **Network mode validation** — Warns if you're running an exposed (Traefik) config on a NAT network or vice versa
- **Firewall setup** — Auto-detects ufw vs firewalld, detects your SSH port from `sshd_config`, and prompts before modifying SSH rules

### What we recommend

- **Always review the script before running it.** Use the preview button. Read the output. If something looks wrong, don't run it.
- **Use the manual installation method** if you're uncomfortable with `curl | bash`. Download the `docker-compose.yml` and inspect it at your own pace.
- **Run on a dedicated VPS or homelab machine**, not on a system with sensitive data.
- **Keep your system updated.** Monero Suite generates the initial config, but ongoing security (OS patches, Docker updates) is your responsibility. You can use the included Watchtower and Autoheal services to help with this.

## Risks and Disclaimer

**This software is provided as-is, without warranty of any kind.** By using Monero Suite, you acknowledge:

- **You are responsible for your own infrastructure.** Monero Suite generates configuration files — it does not manage, monitor, or maintain your deployment after installation.
- **Running a Monero node may have legal implications** depending on your jurisdiction. Research your local regulations.
- **The `curl | bash` install method executes remote code as root.** While we implement safeguards (script preview, server-side bash generation, temporary storage), this inherently requires trust. If this concerns you, use the manual installation method instead.
- **Docker images are pulled from third-party registries** (Docker Hub, GitHub Container Registry). Monero Suite does not build or host these images. You are trusting the upstream maintainers of each service.
- **This project is in active development.** Bugs may exist. Configurations may change between versions.

This project is not affiliated with, endorsed by, or sponsored by the Monero Project.

## Roadmap

- Merchant software ([MoneroPay](https://github.com/moneropay/moneropay), [HotShop](https://github.com/CryptoGrampy/HotShop))
- [Monero Light Wallet Server](https://github.com/vtnerd/monero-lws)
- [Onion Monero Blockchain Explorer](https://github.com/moneroexamples/onion-monero-blockchain-explorer) (JavaScript-free block explorer)
- [nerostr](https://github.com/pluja/nerostr) (Monero-paid Nostr relay)

## Contributing

Contributions are welcome. Open an issue or submit a pull request.

## License

[MIT](LICENSE)
