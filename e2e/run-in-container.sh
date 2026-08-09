#!/usr/bin/env bash
# Run the UI-generated install.sh inside a privileged Debian+systemd container.
# Expects e2e/artifacts/install.sh (and optionally docker-compose.yml) to exist.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARTIFACTS_DIR="${SCRIPT_DIR}/artifacts"
INSTALL_SH="${ARTIFACTS_DIR}/install.sh"
RUN_LOG="${ARTIFACTS_DIR}/install-run.log"
CONTAINER_LOG="${ARTIFACTS_DIR}/container-docker.log"
IMAGE_NAME="${E2E_IMAGE_NAME:-monero-suite-e2e:local}"
CONTAINER_NAME="${E2E_CONTAINER_NAME:-e2e-installer}"
DOCKER_DATA_VOLUME="${E2E_DOCKER_DATA_VOLUME:-e2e-installer-docker-data}"
COMPOSE_PATH_IN_CONTAINER="/root/monero-suite/docker-compose.yml"

# Polls
SYSTEMD_ATTEMPTS="${E2E_SYSTEMD_ATTEMPTS:-30}"
SYSTEMD_SLEEP_SECS="${E2E_SYSTEMD_SLEEP_SECS:-2}"
MONEROD_ATTEMPTS="${E2E_MONEROD_ATTEMPTS:-12}"
MONEROD_SLEEP_SECS="${E2E_MONEROD_SLEEP_SECS:-10}"
MONITORING_ATTEMPTS="${E2E_MONITORING_ATTEMPTS:-24}"
MONITORING_SLEEP_SECS="${E2E_MONITORING_SLEEP_SECS:-5}"
GRAFANA_ATTEMPTS="${E2E_GRAFANA_ATTEMPTS:-24}"
GRAFANA_SLEEP_SECS="${E2E_GRAFANA_SLEEP_SECS:-5}"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

require_file() {
  [[ -f "$1" ]] || die "missing required file: $1"
}

# Wait until docker container $1 reports State.Status=running.
# Fails fast on restarting|exited|dead. Empty/missing keeps polling.
wait_container_running() {
  local name="$1"
  local attempts="$2"
  local sleep_secs="$3"
  local i status
  for ((i = 1; i <= attempts; i++)); do
    status="$(
      docker exec "${CONTAINER_NAME}" bash -c \
        "docker inspect -f '{{.State.Status}}' ${name} 2>/dev/null || true"
    )"
    echo "    attempt ${i}/${attempts}: ${name} status='${status:-missing}'"
    if [[ "${status}" == "running" ]]; then
      return 0
    fi
    if [[ "${status}" == "restarting" || "${status}" == "exited" || "${status}" == "dead" ]]; then
      die "${name} container status is ${status}"
    fi
    sleep "${sleep_secs}"
  done
  die "${name} did not reach running state in time"
}

dump_debug() {
  echo "--- dumping debug logs ---" >&2
  {
    echo "===== docker logs ${CONTAINER_NAME} ====="
    docker logs "${CONTAINER_NAME}" 2>&1 || true
    echo "===== docker compose ps (in container) ====="
    docker exec "${CONTAINER_NAME}" bash -c \
      "docker compose -f ${COMPOSE_PATH_IN_CONTAINER} ps -a 2>&1 || true" 2>&1 || true
    echo "===== monerod logs (if any) ====="
    docker exec "${CONTAINER_NAME}" bash -c \
      "docker logs monerod 2>&1 | tail -n 200 || true" 2>&1 || true
    for c in grafana prometheus monerod_exporter nodemapper; do
      echo "===== ${c} logs (if any) ====="
      docker exec "${CONTAINER_NAME}" bash -c \
        "docker logs ${c} 2>&1 | tail -n 200 || true" 2>&1 || true
    done
    if [[ -f "${ARTIFACTS_DIR}/grafana-health.err" ]]; then
      echo "===== grafana-health.err ====="
      cat "${ARTIFACTS_DIR}/grafana-health.err" 2>&1 || true
    fi
    if [[ -f "${ARTIFACTS_DIR}/grafana-health.json" ]]; then
      echo "===== grafana-health.json ====="
      cat "${ARTIFACTS_DIR}/grafana-health.json" 2>&1 || true
    fi
  } >"${CONTAINER_LOG}" 2>&1 || true
  echo "Wrote ${CONTAINER_LOG}" >&2
}

teardown() {
  local ec=$?
  set +e
  if docker inspect "${CONTAINER_NAME}" >/dev/null 2>&1; then
    if [[ $ec -ne 0 ]]; then
      dump_debug
    fi
    # Stop monerod sync ASAP if compose was written.
    docker exec "${CONTAINER_NAME}" bash -c \
      "cd /root/monero-suite 2>/dev/null && docker compose down --timeout 30 2>/dev/null || true" \
      || true
    docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
    docker volume rm "${DOCKER_DATA_VOLUME}" >/dev/null 2>&1 || true
  fi
  exit "$ec"
}
trap teardown EXIT

require_file "${INSTALL_SH}"
mkdir -p "${ARTIFACTS_DIR}"
: >"${RUN_LOG}"

echo "==> Building systemd base image (${IMAGE_NAME})"
docker build -t "${IMAGE_NAME}" -f "${SCRIPT_DIR}/Dockerfile.systemd" "${SCRIPT_DIR}"

# Ensure a clean name for this run.
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
docker volume rm "${DOCKER_DATA_VOLUME}" >/dev/null 2>&1 || true
docker volume create "${DOCKER_DATA_VOLUME}" >/dev/null

echo "==> Starting privileged container with systemd as PID 1"
# Nested Docker on GHA cannot use overlay-on-overlay; mount a real volume for
# /var/lib/docker and force the vfs storage driver before install.sh starts dockerd.
docker run -d \
  --name "${CONTAINER_NAME}" \
  --privileged \
  --cgroupns=host \
  -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
  -v "${DOCKER_DATA_VOLUME}:/var/lib/docker" \
  --tmpfs /tmp \
  --tmpfs /run \
  --tmpfs /run/lock \
  "${IMAGE_NAME}"

echo "==> Waiting for systemd"
systemd_ready=0
for ((i = 1; i <= SYSTEMD_ATTEMPTS; i++)); do
  state="$(docker exec "${CONTAINER_NAME}" systemctl is-system-running 2>/dev/null || true)"
  # running | degraded are both acceptable (some units mask under container).
  if [[ "${state}" == "running" || "${state}" == "degraded" ]]; then
    echo "    systemd is ${state} (attempt ${i}/${SYSTEMD_ATTEMPTS})"
    systemd_ready=1
    break
  fi
  echo "    systemd state='${state:-unknown}' (attempt ${i}/${SYSTEMD_ATTEMPTS})"
  sleep "${SYSTEMD_SLEEP_SECS}"
done
[[ "${systemd_ready}" -eq 1 ]] || die "systemd did not become ready in time"

echo "==> Pre-seeding Docker daemon config for nested container (vfs storage)"
# get.docker.com installs Docker and enables the unit; dockerd reads this on first start.
docker exec "${CONTAINER_NAME}" bash -c 'mkdir -p /etc/docker && cat > /etc/docker/daemon.json <<EOF
{
  "storage-driver": "vfs",
  "iptables": true,
  "ip-forward": true
}
EOF'

echo "==> Copying install.sh into container"
docker cp "${INSTALL_SH}" "${CONTAINER_NAME}:/root/install.sh"
docker exec "${CONTAINER_NAME}" chmod +x /root/install.sh

echo "==> Running install.sh --verbose (log: ${RUN_LOG})"
# Stream install output to log and stdout.
set +e
docker exec "${CONTAINER_NAME}" bash /root/install.sh --verbose 2>&1 | tee "${RUN_LOG}"
install_ec=${PIPESTATUS[0]}
set -e
[[ "${install_ec}" -eq 0 ]] || die "install.sh exited with ${install_ec}"

echo "==> Polling monerod container status"
wait_container_running "monerod" "${MONEROD_ATTEMPTS}" "${MONEROD_SLEEP_SECS}"

echo "==> RPC probe (unrestricted RPC inside monerod container)"
# Port 18081 is not published to the host in local networkMode; probe inside monerod.
# Prefer /get_info (simple HTTP JSON, same family as the monerod healthcheck's
# /get_height). /get_version is JSON-RPC-only and fails with curl GET + -f.
rpc_ok=0
RPC_ATTEMPTS="${E2E_RPC_ATTEMPTS:-18}"
RPC_SLEEP_SECS="${E2E_RPC_SLEEP_SECS:-5}"
for ((i = 1; i <= RPC_ATTEMPTS; i++)); do
  # Capture both stdout and curl/docker errors for debugging.
  if docker exec "${CONTAINER_NAME}" bash -c \
    'docker exec monerod curl -sS --max-time 5 http://127.0.0.1:18081/get_info' \
    >"${ARTIFACTS_DIR}/get_info.json" 2>"${ARTIFACTS_DIR}/get_info.err"; then
    if grep -Eq '"height"|status' "${ARTIFACTS_DIR}/get_info.json" 2>/dev/null; then
      rpc_ok=1
      break
    fi
  fi
  err="$(tr '\n' ' ' <"${ARTIFACTS_DIR}/get_info.err" 2>/dev/null || true)"
  echo "    RPC not ready yet (attempt ${i}/${RPC_ATTEMPTS})${err:+ — ${err}}"
  sleep "${RPC_SLEEP_SECS}"
done
[[ "${rpc_ok}" -eq 1 ]] || die "RPC probe failed — no JSON from get_info"
echo "    get_info response:"
cat "${ARTIFACTS_DIR}/get_info.json"
echo

echo "==> Polling monitoring stack containers"
for c in grafana prometheus monerod_exporter nodemapper; do
  wait_container_running "${c}" "${MONITORING_ATTEMPTS}" "${MONITORING_SLEEP_SECS}"
done

echo "==> Grafana /api/health probe"
grafana_ok=0
for ((i = 1; i <= GRAFANA_ATTEMPTS; i++)); do
  if docker exec "${CONTAINER_NAME}" bash -c \
    'curl -sS --max-time 5 http://127.0.0.1:3000/api/health' \
    >"${ARTIFACTS_DIR}/grafana-health.json" 2>"${ARTIFACTS_DIR}/grafana-health.err"; then
    # Grafana returns JSON like {"database":"ok",...} (spacing may vary).
    if grep -Eq '"database"[[:space:]]*:[[:space:]]*"ok"' \
      "${ARTIFACTS_DIR}/grafana-health.json" 2>/dev/null; then
      grafana_ok=1
      break
    fi
  fi
  err="$(tr '\n' ' ' <"${ARTIFACTS_DIR}/grafana-health.err" 2>/dev/null || true)"
  body="$(tr '\n' ' ' <"${ARTIFACTS_DIR}/grafana-health.json" 2>/dev/null || true)"
  echo "    Grafana not healthy yet (attempt ${i}/${GRAFANA_ATTEMPTS})${err:+ — ${err}}${body:+ — body: ${body}}"
  sleep "${GRAFANA_SLEEP_SECS}"
done
[[ "${grafana_ok}" -eq 1 ]] || die "Grafana /api/health probe failed"
echo "    grafana /api/health response:"
cat "${ARTIFACTS_DIR}/grafana-health.json"
echo

echo "==> E2E container run succeeded"
# teardown trap will compose-down + rm container
exit 0
