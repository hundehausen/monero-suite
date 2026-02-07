# Network Anonymity with Monero Suite

This guide explains how to configure Monero Suite for different network anonymity scenarios. It covers Tor proxy modes, anonymous inbound connections, and why certain steps require manual intervention.

**References:**
- [Monero Anonymity Networks Documentation](https://github.com/monero-project/monero/blob/master/docs/ANONYMITY_NETWORKS.md)
- [monerod Reference](https://docs.getmonero.org/interacting/monerod-reference/)

---

## Table of Contents

- [Background: How Monero Uses Tor](#background-how-monero-uses-tor)
- [VPN vs Tor: Which Should You Use?](#vpn-vs-tor-which-should-you-use)
- [Tor Proxy Modes in Monero Suite](#tor-proxy-modes-in-monero-suite)
  - [None (Default)](#none-default)
  - [Tx Only](#tx-only)
  - [Full](#full)
- [Understanding `--proxy` vs `--tx-proxy`](#understanding---proxy-vs---tx-proxy)
- [Anonymous Inbound Connections](#anonymous-inbound-connections)
  - [What Are Anonymous Inbounds?](#what-are-anonymous-inbounds)
  - [Setting Up Anonymous Inbounds with Monero Suite](#setting-up-anonymous-inbounds-with-monero-suite)
- [Why Monero Suite Cannot Auto-Fill the Onion Address](#why-monero-suite-cannot-auto-fill-the-onion-address)
- [Tor Hidden Services for RPC](#tor-hidden-services-for-rpc)
- [Additional Privacy Options](#additional-privacy-options)
  - [Pad Transactions](#pad-transactions)
  - [Hide Port](#hide-port)
- [Scenario Guide](#scenario-guide)
  - [Scenario 1: Basic Privacy (Hide Transactions From ISP)](#scenario-1-basic-privacy-hide-transactions-from-isp)
  - [Scenario 2: Full Tor Routing (Hide That You Run Monero)](#scenario-2-full-tor-routing-hide-that-you-run-monero)
  - [Scenario 3: Full Tor + Accept Anonymous Inbound Connections](#scenario-3-full-tor--accept-anonymous-inbound-connections)
  - [Scenario 4: Remote Wallet via Tor Hidden Service](#scenario-4-remote-wallet-via-tor-hidden-service)
- [Privacy Limitations](#privacy-limitations)
- [Common Mistakes](#common-mistakes)

---

## Background: How Monero Uses Tor

Monero's design separates network traffic into distinct zones:

- **Clearnet (IPv4)**: Used for blockchain syncing, peer discovery, and general P2P communication. Monerod does **not** support syncing the blockchain over Tor hidden services.
- **Anonymity networks (Tor/I2P)**: Used specifically for **transaction broadcasting**. When a wallet submits a transaction to your node, the node can relay it exclusively through Tor/I2P connections, preventing your ISP or network observers from linking your IP address to a specific transaction.

This separation is intentional. The Monero project uses IPv4 for blockchain sync to make Sybil attacks harder (it's expensive to obtain many unique IPv4 addresses, whereas creating many Tor hidden services is cheap). Transaction broadcasting goes through anonymity networks to protect the source of transactions.

## VPN vs Tor: Which Should You Use?

A VPN shifts trust from your ISP to the VPN provider. The VPN provider can see that you're running a Monero node and can observe your traffic patterns. Using a VPN for Monero provides marginal privacy improvement at best, and in some cases can make you more identifiable (if the VPN provider is compromised or logs traffic). All depends on the trustworthiness of the VPN provider.

Tor provides actual anonymity:
- No single relay in the Tor circuit knows both who you are and what you're doing.
- There is no centralized "VPN provider" to subpoena or compromise.
- Monerod has built-in Tor support via `--proxy` and `--tx-proxy` flags, designed specifically for this purpose.

**When a VPN might still make sense:**
- As an additional layer *on top of* Tor (your ISP sees VPN traffic instead of Tor traffic, which can matter in jurisdictions that flag Tor usage).
- If you only need to hide the *fact* that you're running a Monero node from your ISP and trust your VPN provider. But Tor's `--proxy` mode achieves the same thing without trusting a third party.

## Tor Proxy Modes in Monero Suite

When you enable the Tor service in Monero Suite, you choose one of three proxy modes:

### None (Default)

Tor is not used for proxying monerod traffic. You can still enable Tor Hidden Services independently (for RPC access) without routing any monerod traffic through Tor.

### Tx Only

**What it does:** Adds the `--tx-proxy=tor,<tor-ip>:9050,32` flag to monerod.

This is the **recommended mode for most users**. Your node:
- Syncs the blockchain over clearnet (fast, reliable).
- Connects to clearnet peers normally for P2P communication.
- Routes **wallet-originated transactions** exclusively through Tor hidden service peers.
- Includes pre-configured Monero community onion nodes as priority peers, so your node has immediate Tor-capable peers to relay transactions to.

Your ISP can see that you're running a Monero node, but cannot link your IP to any specific transaction you broadcast.

**Generated monerod flags:**
```
--tx-proxy=tor,172.28.1.2:9050,32
--add-priority-node=xwvz3ekocr3dkyxfkmgm2hvbpzx2ysqmaxgter7znnqrhoicygkfswid.onion:18084
--add-priority-node=4pixvbejrvihnkxmduo2agsnmc3rrulrqc7s3cbwwrep6h6hrzsibeqd.onion:18084
... (6 priority nodes + 6 peer nodes)
```

> **Note:** "Forwarded transactions" (transactions your node received from other peers and relays onward) are still relayed over clearnet. Only transactions originating from wallets directly connected to your node are sent through Tor.

### Full

**What it does:** Adds both `--proxy=<tor-ip>:9050` and `--tx-proxy=tor,<tor-ip>:9050,32` to monerod, plus `--no-igd`.

Your node:
- Routes **all** IPv4 P2P traffic through Tor (SOCKS4 proxy), including blockchain sync.
- Routes wallet-originated transactions through Tor hidden service peers.
- Disables UPnP port forwarding (`--no-igd`) since it's unnecessary behind Tor.

Your ISP sees Tor traffic but **cannot tell you are running Monero**. However, blockchain sync is significantly slower since all data flows through Tor circuits.

**Generated monerod flags:**
```
--proxy=172.28.1.2:9050
--tx-proxy=tor,172.28.1.2:9050,32
--no-igd
--add-priority-node=xwvz3...onion:18084
... (priority + peer nodes)
```

> **Important:** The `--proxy` flag uses SOCKS4, which routes traffic to clearnet IPv4 peers through Tor — it does not connect to `.onion` hidden services. The `--tx-proxy` flag handles connections to `.onion` peers for transaction relay.

## Understanding `--proxy` vs `--tx-proxy`

These two flags serve different purposes and are often confused:

| Flag | Purpose | Protocol | Connects to | Used by Monero Suite |
|------|---------|----------|-------------|---------------------|
| `--proxy` | Route **all** IPv4 traffic through a proxy | SOCKS4 | Clearnet IPv4 peers (via Tor exit nodes) | "Full" mode |
| `--tx-proxy` | Route **wallet-originated transactions** through anonymity network | SOCKS5 | `.onion` hidden service peers | "Tx only" and "Full" modes |

**Key behaviors of `--tx-proxy`:**
- Transactions from directly connected wallets that lack a valid P2P "context" (i.e., didn't arrive from another peer) are *only* sent to Tor peers.
- If no Tor peers are available, the transaction is **held in a queue** and not broadcast over clearnet. It will be sent once a Tor connection is established, or when monerod is restarted without `--tx-proxy`.
- Only handshakes, peer timed syncs, and transaction broadcasts are supported over anonymity network connections.

**You can use them together** (as "Full" mode does): `--proxy` hides your Monero usage from your ISP, while `--tx-proxy` ensures transactions go through dedicated Tor circuits to `.onion` peers.

## Anonymous Inbound Connections

### What Are Anonymous Inbounds?

By default, even with `--tx-proxy` enabled, your node *initiates* outgoing connections to Tor peers but doesn't *accept* incoming connections from Tor peers. The `--anonymous-inbound` flag changes this.

When you configure anonymous inbound connections:

1. You set up a **Tor hidden service** that forwards traffic to your monerod's P2P port.
2. You tell monerod your `.onion` address via `--anonymous-inbound`.
3. Monerod **shares your `.onion` address** with other Tor peers it connects to, so they (and their peers) can find and connect to your node.
4. Other nodes can now relay transactions to you over Tor, and you become a useful peer in the Tor-based Monero network.

**The format is:**
```
--anonymous-inbound=<onion-address>:<port>,<bind-ip>:<bind-port>[,max_connections]
```

For example:
```
--anonymous-inbound=yourlongv3onionaddress.onion:18084,127.0.0.1:18084,25
```

This tells monerod:
- Your Tor hidden service address is `yourlongv3onionaddress.onion:18084`
- Tor forwards incoming connections to `127.0.0.1:18084`
- Accept up to 25 anonymous inbound connections

> **Important:** The port used for `--anonymous-inbound` must be **different** from the standard P2P port (18080). The convention is port 18084. Anonymous inbound connections are only for transaction relay, not blockchain sync.

> **Requirement:** `--anonymous-inbound` must be used together with `--tx-proxy`. Without `--tx-proxy`, your onion address won't be shared with Tor peers.

### Setting Up Anonymous Inbounds with Monero Suite

Setting up anonymous inbound connections requires a **two-phase process** because the Tor container must generate the onion address before monerod can use it.

#### Phase 1: Initial Deployment (Generate the Onion Address)

1. **In Monero Suite, enable Tor** and select either "Tx only" or "Full" proxy mode.
2. **Enable Tor Hidden Services** — check the "Enable Tor Hidden Services" checkbox in the Tor section. This configures the Tor container to create hidden services for your enabled services.
3. **Leave the "Anonymous Inbound" field empty** in the monerod Advanced Settings > Tor/I2P section for now.
4. **Deploy your configuration** (generate the install script or docker-compose and run it).
5. **Wait for the Tor container to start** and generate its onion addresses. This takes 30 seconds to a few minutes.
6. **Retrieve your onion address:**
   ```bash
   docker logs tor
   ```
   Look for the generated `.onion` hostname for the monerod service.

#### Phase 2: Configure Anonymous Inbound

7. **Go back to Monero Suite** and open the monerod Advanced Settings modal.
8. **Navigate to the Tor/I2P section.**
9. **Enter your onion address** in the "Anonymous Inbound" field using the format:
   ```
   yourlongv3onionaddress.onion:18084,127.0.0.1:18084,25
   ```
   Replace `yourlongv3onionaddress` with the actual address from the Tor container logs.
10. **Re-deploy your configuration** — generate a new install script or docker-compose and update your deployment.

After this, your node will:
- Accept incoming P2P connections from other Tor-enabled Monero nodes.
- Share your `.onion` address with Tor peers, making your node discoverable on the Tor network.
- Relay transactions both to and from Tor peers.

## Why Monero Suite Cannot Auto-Fill the Onion Address

You might wonder why Monero Suite doesn't just generate the onion address automatically and insert it into the monerod configuration. There are several fundamental reasons:

### 1. The Onion Address Doesn't Exist Yet at Configuration Time

Monero Suite is a **configuration generator** — it produces Docker Compose files, environment files, and install scripts. These are generated *before* any containers run. The Tor container generates its onion address **at runtime** when it first starts and creates its cryptographic key pair. The address is derived from this key pair and literally does not exist until the Tor container runs for the first time.

There is no way to predict or pre-compute a Tor v3 onion address — it is derived from a newly generated Ed25519 keypair.

### 2. Monero Suite Runs in the Browser, Tor Runs on Your Server

Monero Suite runs entirely in your browser (client-side). The Tor container will run on your server. These are completely separate environments. Monero Suite has no access to your server, cannot execute commands on it, and cannot read container logs. It generates static configuration files that you then transfer to your server.

### 3. The Install Script is Self-Contained by Design

A core philosophy of Monero Suite is **transparency and auditability**. The generated install script is fully self-contained — it embeds the docker-compose.yml and .env as heredocs and makes zero network callbacks. Introducing a "phone-home" mechanism to fetch a generated onion address would violate this principle and the Monero community's expectation that they can audit exactly what runs on their machine.

### 4. The Hidden Service Config is Separate from the P2P Config

The Tor container's hidden service (configured via `HS_MONEROD_MAINNET` environment variable) creates a mapping from `onion_address:port` to an internal Docker network address. The `--anonymous-inbound` flag on monerod is a *separate* configuration that tells monerod its own onion address so it can advertise it to peers. These are two different pieces of configuration managed by two different containers. Automating this would require an orchestration layer that monitors Tor's output and dynamically reconfigures monerod — complexity that would make the setup harder to audit and debug.

### In Summary

The two-phase deployment is an inherent consequence of how Tor hidden services work: the address is generated from a runtime cryptographic operation, and monerod needs to know this address at startup. This is the same manual step required in any Tor hidden service setup, not a limitation specific to Monero Suite.

## Tor Hidden Services for RPC

Separate from the P2P anonymous inbound feature, Monero Suite can configure Tor hidden services for **RPC access**. This allows wallets to connect to your node's restricted RPC port over Tor.

When you enable "Tor Hidden Services" in Monero Suite, the Tor container is configured to create hidden services for each enabled service:

| Service | Internal Mapping | Use Case |
|---------|-----------------|----------|
| Monerod (mainnet) | `monerod:18089 -> onion:18089` | Wallet connects to restricted RPC over Tor |
| Monerod (stagenet) | `monerod-stagenet:38089 -> onion:38089` | Stagenet wallet RPC |
| P2Pool | `p2pool:3333 -> onion:3333` | Mining stratum over Tor |
| Moneroblock | `moneroblock:31312 -> onion:80` | Block explorer over Tor |
| Onion Explorer | `explorer:8081 -> onion:80` | Blockchain explorer over Tor |
| Grafana | `grafana:3000 -> onion:80` | Monitoring dashboard over Tor |

After deployment, run `docker logs tor` to get the onion addresses for each service.

**Wallet connection example (using the RPC hidden service):**
```bash
monero-wallet-cli \
    --proxy 127.0.0.1:9050 \
    --daemon-address yourlongv3onionaddress.onion:18089
```

> **Note:** When hidden services are enabled, Monero Suite automatically adds `--disable-rpc-ban` to monerod. This is necessary because all Tor connections appear to come from the same IP (the Tor container), and without this flag, monerod might incorrectly ban the Tor exit point.

## Additional Privacy Options

### Pad Transactions

**Monero Suite:** Monerod Advanced Settings > Tor/I2P > "Pad Transactions" toggle.

**monerod flag:** `--pad-transactions`

Pads relayed transactions to the next 1024-byte boundary. Without padding, an observer monitoring your network traffic could use the exact size of a transmitted message to correlate it with a transaction that appears on the network shortly after. With padding, multiple transactions look the same size on the wire.

This is most effective when combined with Tor (`--tx-proxy` or `--proxy`), as the padding helps prevent traffic analysis at the Tor circuit level.

**Trade-off:** Slightly increases bandwidth usage.

### Hide Port

**Monero Suite:** Monerod Advanced Settings > Network > "Hide Port" toggle.

**monerod flag:** `--hide-my-port`

Prevents your node from advertising itself in peer lists. Other nodes won't learn your IP from peer exchange. Your node still initiates outgoing connections and participates normally — it just won't be listed as a connectable peer.

This does **not** make your node a "leech" — it still contributes to the network by relaying blocks and transactions. It simply prevents your IP:port from being propagated to other nodes' peer lists.

## Scenario Guide

### Scenario 1: Basic Privacy (Hide Transactions From ISP)

**Goal:** Your ISP can see you run a Monero node, but cannot link your IP to any specific transaction.

**Monero Suite configuration:**
1. Enable Tor service.
2. Set Tor Proxy to **"Tx only"**.
3. Optionally enable **Pad Transactions** in monerod Advanced Settings > Tor/I2P.

**What happens:**
- Blockchain syncs over clearnet (fast).
- Your transactions are relayed only to `.onion` peers via Tor.
- Pre-configured community onion nodes ensure you have Tor peers immediately.

**Generated monerod flags:**
```
--tx-proxy=tor,172.28.1.2:9050,32
--add-priority-node=xwvz3...onion:18084
--pad-transactions  (if enabled)
```

**Suitable for:** Home users, VPS operators who don't mind their hosting provider knowing they run Monero.

### Scenario 2: Full Tor Routing (Hide That You Run Monero)

**Goal:** Your ISP cannot tell you are running a Monero node at all.

**Monero Suite configuration:**
1. Enable Tor service.
2. Set Tor Proxy to **"Full"**.
3. Enable **Pad Transactions**.
4. Enable **Hide Port** in monerod Advanced Settings > Network.

**What happens:**
- All monerod traffic is routed through Tor (SOCKS4 proxy).
- Blockchain sync is slower but your ISP only sees Tor traffic.
- Transactions go through dedicated Tor circuits to `.onion` peers.
- Your node doesn't advertise its IP.

**Generated monerod flags:**
```
--proxy=172.28.1.2:9050
--tx-proxy=tor,172.28.1.2:9050,32
--no-igd
--pad-transactions
--hide-my-port
--add-priority-node=xwvz3...onion:18084
```

**Trade-offs:**
- Initial blockchain sync will be significantly slower.
- Ongoing sync is slower but usually tolerable once caught up.

**Suitable for:** Users in restrictive jurisdictions, users who need to hide Monero usage from their ISP.

### Scenario 3: Full Tor + Accept Anonymous Inbound Connections

**Goal:** Maximum anonymity while also being a useful peer in the Tor-based Monero network.

**Monero Suite configuration (Phase 1):**
1. Enable Tor service.
2. Set Tor Proxy to **"Full"** (or "Tx only" if you don't need to hide from ISP).
3. Enable **Tor Hidden Services**.
4. Enable **Pad Transactions**.
5. Deploy and wait for Tor container to generate onion addresses.
6. Run `docker logs tor` to get the P2P onion address.

**Monero Suite configuration (Phase 2):**
7. Open monerod Advanced Settings > Tor/I2P.
8. Enter **Anonymous Inbound**: `youronionaddress.onion:18084,127.0.0.1:18084,25`
9. Re-deploy.

**What happens:**
- All the benefits of Scenario 2.
- Other Tor-enabled nodes can find and connect to your node.
- Your node shares its `.onion` address with peers, strengthening the Tor-based Monero network.
- You help relay transactions for other users over Tor.

**Generated monerod flags:**
```
--proxy=172.28.1.2:9050  (if Full mode)
--tx-proxy=tor,172.28.1.2:9050,32
--no-igd  (if Full mode)
--pad-transactions
--anonymous-inbound=youronionaddress.onion:18084,127.0.0.1:18084,25
--disable-rpc-ban
```

**Suitable for:** Users who want to contribute to Monero's anonymity network and accept being discoverable by other Tor-using Monero nodes (but not by clearnet nodes).

### Scenario 4: Remote Wallet via Tor Hidden Service

**Goal:** Connect a wallet from a separate machine to your node entirely over Tor.

**Monero Suite configuration:**
1. Enable Tor service (proxy mode can be any setting).
2. Enable **Tor Hidden Services**.
3. Deploy and run `docker logs tor` to get the RPC onion address.

**On the wallet machine:**
```bash
# Ensure Tor is running locally on the wallet machine
monero-wallet-cli \
    --proxy 127.0.0.1:9050 \
    --daemon-address youronionaddress.onion:18089
```

**What happens:**
- The wallet connects to your node's restricted RPC (port 18089) entirely through Tor.
- The connection is end-to-end encrypted by Tor.
- Neither your ISP nor the wallet machine's ISP can see the wallet-node communication.

**Suitable for:** Running a wallet on a laptop that connects to your home/VPS node without exposing the RPC port to the internet.

## Privacy Limitations

Even with Tor configured, some metadata leakage is possible. These are documented limitations of Monero's current anonymity network integration:

### Timestamp Correlation

Monerod's peer timed sync messages include the current system time. If an adversary controls both a clearnet peer and a Tor peer connected to your node, they could correlate the timestamps to link your clearnet IP with your `.onion` address.

**Mitigation:** Keep your system clock accurate (use NTP). The more accurate your clock, the less distinguishable your timestamps are from other nodes.

### Intermittent Syncing

If you only run monerod when sending transactions, your ISP can correlate your Tor/Monero activity with transactions appearing on the network.

**Mitigation:** Run monerod continuously, not just when you need to send transactions.

### Tor Stream Reuse

If the same Tor circuit is used for two transactions, the hidden service operator can link them. If the second transaction spends a change output from the first, this also reveals the real spend in the ring signature.

**Mitigation:** Monerod rotates its selected outgoing Tor connections every 5 minutes. The change address lock time is ~20 minutes, providing several rotation cycles. Avoid sending transactions in rapid succession.

### Forwarded Transaction Leakage

When using `--tx-proxy`, only transactions **originating from your directly connected wallets** are sent exclusively through Tor. Transactions your node receives from other peers and relays onward still travel over clearnet.

This means `--tx-proxy` protects *your* transactions, not all transactions your node touches.

## Common Mistakes

**Using `--proxy` alone without `--tx-proxy`:**
The `--proxy` flag routes all traffic through a SOCKS4 proxy but treats it as clearnet. It does *not* connect to `.onion` peers or enable anonymity-network transaction broadcasting. Always use `--tx-proxy` if your goal is anonymous transaction relay.

**Using the wrong port for anonymous inbound:**
The anonymous inbound port must be different from the standard P2P port (18080). Use 18084 (the convention). The hidden service must be configured to forward this port.

**Forgetting `--tx-proxy` with `--anonymous-inbound`:**
Without `--tx-proxy`, your onion address won't be shared with Tor peers. The `--anonymous-inbound` flag tells monerod *what* your address is, but `--tx-proxy` is what enables Tor peer communication and address sharing.

**Expecting blockchain sync over Tor hidden services:**
Monerod does not sync the blockchain over `.onion` connections. Even with `--proxy` (Full mode), the blockchain syncs from clearnet IPv4 peers *routed through* Tor exit nodes — not from hidden services. This is by design to resist Sybil attacks.

**Running monerod only when transacting:**
This creates a timing correlation that can link your Monero activity to on-chain transactions. Run your node 24/7 for best privacy.
