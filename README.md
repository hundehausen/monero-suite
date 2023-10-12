# Monero Suite

This project lets you run a Monero node, P2Pool, and MoneroBlock in Docker containers. It also includes Tor for anonymity and Watchtower for auto-updating the containers.

- [monerod](http://getmonero.org) (the Monero daemon)
- [P2Pool](https://github.com/SChernykh/p2pool) (a decentralized mining pool for Monero)
- [Traefik](https://traefik.io) (a reverse proxy for monerod, P2Pool, and MoneroBlock)
- [MoneroBlock](https://github.com/duggavo/MoneroBlock) (a Monero block explorer)
- [Tor](https://www.torproject.org) (anonymity network for monerod, P2Pool and MoneroBlock)
- [Docker Autoheal](https://github.com/willfarrell/docker-autoheal) (auto-restart unhealthy containers)
- [Watchtower](https://github.com/containrrr/watchtower) (auto-update containers)

Disclaimer: This project is not affiliated with, endorsed by, or sponsored by the Monero Project.

## Quick Start
You need to have [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed. It could also work with Podman, but I haven't tested it.

Go to [monersuite.org](https://monerosuite.org/)

Save the generated docker-compose.yml file to a directory and run the following command in that directory:
``` 
docker compose up -d
```
It will take some time to download the images and start the containers. You can check the status of the containers with:
```
docker compose ps
```
or a more interactive view with [Portainer](https://www.portainer.io) or [LazyDocker](https://github.com/jesseduffield/lazydocker).

If you are looking for the urls of the hidden services that were generated when starting the tor container for the first time, you can find them in the container logs:
```
docker compose logs tor
```

## Roadmap
no particular order

- add Monero Wallet RPC (if someone needs that?)
- add [xmrig](https://github.com/xmrig/xmrig) and [xmrig-proxy](https://github.com/xmrig/xmrig-proxy)
- add merchant software. Maybe BTCPayServer, [MoneroPay](https://github.com/moneropay/moneropay), [HotShop](https://github.com/CryptoGrampy/HotShop)
- add [Monero Light Wallet Server](https://github.com/vtnerd/monero-lws)
- add [Onion Monero Blockchain Explorer](https://github.com/moneroexamples/onion-monero-blockchain-explorer) (a Monero block explorer without JavaScript)
- add Gitea (a self-hosted Git service) to mirror the Monero repositories

## Donations
If you find this project useful, please consider donating to the following address:

87cQNxrM3oWVkZ8TRWUHi9LmvruKgQSA7AxqoqJDr7n1PgGcZkXhAToVz3rEWxjAMj7caKCcqjYfDSFeLey1Sf4hUF3gmNn