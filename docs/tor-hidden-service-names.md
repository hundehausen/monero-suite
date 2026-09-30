# Keep existing Tor onion addresses

Hidden-service names now identify the network, P2Pool mode, or exposed API:

| Previous environment variable | New environment variable |
| --- | --- |
| `HS_MONEROD_MAINNET` | `HS_MONEROD_MAINNET_RESTRICTED_RPC` |
| `HS_MONEROD_P2P` | `HS_MONEROD_MAINNET_P2P` |
| `HS_MONEROD_MAINNET_STAGENET` | `HS_MONEROD_STAGENET_RESTRICTED_RPC` |
| `HS_P2POOL` | `HS_P2POOL_FULL_STRATUM` |
| `HS_P2POOL_MINI` | `HS_P2POOL_MINI_STRATUM` |
| `HS_P2POOL_NANO` | `HS_P2POOL_NANO_STRATUM` |
| `HS_MONERO_LWS` | `HS_MONERO_LWS_REST_API` |
| `HS_MONEROPAY` | `HS_MONEROPAY_API` |

The Tor image stores each service's keys in `/var/lib/tor/<name>` without the `HS_` prefix.
Changing the variable name creates a new key directory and a new onion address unless you move the existing directory first.

For an existing deployment, run these commands from the directory containing your updated `docker-compose.yml`.
Keep the same Compose project name and `tor-data` volume.

1. Stop Tor:

   ```bash
	docker compose stop tor
   ```

2. Rename the existing key directories:

   ```bash
	docker compose run --rm --no-deps --entrypoint sh tor -c '
		set -e
		for rename in \
			MONEROD_MAINNET:MONEROD_MAINNET_RESTRICTED_RPC \
			MONEROD_P2P:MONEROD_MAINNET_P2P \
			MONEROD_MAINNET_STAGENET:MONEROD_STAGENET_RESTRICTED_RPC \
			P2POOL:P2POOL_FULL_STRATUM \
			P2POOL_MINI:P2POOL_MINI_STRATUM \
			P2POOL_NANO:P2POOL_NANO_STRATUM \
			MONERO_LWS:MONERO_LWS_REST_API \
			MONEROPAY:MONEROPAY_API
		do
			old="/var/lib/tor/${rename%%:*}"
			new="/var/lib/tor/${rename#*:}"
			if [ -d "$old" ] && [ ! -e "$new" ]; then
				mv "$old" "$new"
			fi
		done
	'
   ```

   This skips absent services and directories that already have the new name.
   If Tor has already created a new directory, the command leaves both directories intact.
   To restore the old address, stop Tor and move the new directory aside before rerunning step 2.

3. Start the updated services:

   ```bash
	docker compose up -d
   ```

4. Check that the onion addresses match your previous deployment:

   ```bash
	docker compose logs tor
   ```

New deployments do not need this migration.
