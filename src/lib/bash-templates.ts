export const APT_UPGRADE_ENV =
  "DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=l";
export const APT_UPGRADE_BIN =
  "apt-get upgrade -y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold";
export const DNF_UPGRADE_BIN = "dnf upgrade -y";
export const YUM_UPGRADE_BIN = "yum update -y";

/** Root/sudo gate. Prompts on /dev/tty so curl|bash stdin is not consumed. Shared with tests. */
export const CHECK_PRIVILEGES_FN = `check_privileges() {
    local euid="\${CHECK_EUID:-\$EUID}"
    if [ "$euid" -eq 0 ]; then
        SUDO=""
        echo -e "\${GREEN}[✓]\${NC} Running as root"
        return 0
    fi
    if ! command -v sudo >/dev/null 2>&1; then
        echo -e "\${RED}Error: This script requires root privileges. Please run as root or install sudo.\${NC}"
        exit 1
    fi
    SUDO="sudo"
    if $SUDO -n true >/dev/null 2>&1; then
        echo -e "\${GREEN}[✓]\${NC} sudo is available"
        return 0
    fi
    local tty="\${SUDO_TTY:-/dev/tty}"
    if [ ! -e "$tty" ] || [ ! -r "$tty" ] || [ ! -w "$tty" ]; then
        echo -e "\${RED}Error: sudo needs a password, but no terminal is available to prompt. Run as root, or from a real terminal so sudo can ask for a password.\${NC}"
        exit 1
    fi
    echo -e "\${YELLOW}sudo password required\${NC}"
    if ! $SUDO -v <"$tty" >"$tty" 2>"$tty"; then
        echo -e "\${RED}Error: sudo authentication failed.\${NC}"
        exit 1
    fi
    echo -e "\${GREEN}[✓]\${NC} sudo is available"
}`

/** Install tree under the effective-uid home, never SUDO_USER. Shared with tests. */
export const RESOLVE_INSTALL_DIR_FN = `resolve_install_dir() {
    INSTALL_USER=$(id -un 2>/dev/null || true)
    INSTALL_HOME=""
    if [ -n "$INSTALL_USER" ]; then
        INSTALL_HOME=$(getent passwd "$INSTALL_USER" 2>/dev/null | cut -d: -f6 || true)
    fi
    INSTALL_HOME=\${INSTALL_HOME:-\$HOME}
    if [ -z "$INSTALL_HOME" ]; then
        echo -e "\${RED}Error: Could not determine home directory for install.\${NC}"
        exit 1
    fi
    INSTALL_DIR="$INSTALL_HOME/monero-suite"
    echo -e "\${GREEN}[✓]\${NC} Install directory: $INSTALL_DIR"
}`

/** Maps os-release ID + ID_LIKE to apt, dnf, or yum. Shared with tests. */
export const RESOLVE_PKG_MANAGER_FN = `pick_rpm_pkg_manager() {
    if command -v dnf >/dev/null 2>&1; then
        PKG_MANAGER="dnf"
    elif command -v yum >/dev/null 2>&1; then
        PKG_MANAGER="yum"
    else
        echo -e "$RED""Error: No dnf or yum found.""$NC"
        exit 1
    fi
}

resolve_pkg_manager() {
    local id="$1"
    local like
    like=$(printf '%s' "$2" | tr '[:upper:]' '[:lower:]')

    case "$id" in
        ubuntu|debian|linuxmint|pop|elementary|zorin|raspbian|kali)
            PKG_MANAGER="apt"
            return
            ;;
        fedora)
            PKG_MANAGER="dnf"
            return
            ;;
        centos|rhel|rocky|almalinux|ol|amzn)
            pick_rpm_pkg_manager
            return
            ;;
    esac

    case " $like " in
        *" debian "*|*" ubuntu "*)
            PKG_MANAGER="apt"
            ;;
        *" fedora "*|*" rhel "*|*" centos "*)
            pick_rpm_pkg_manager
            ;;
        *)
            echo -e "$RED""Error: Unsupported OS '$id'. Supported: Debian/Ubuntu and derivatives, Fedora, CentOS, Rocky, AlmaLinux, RHEL.""$NC"
            exit 1
            ;;
    esac
}`;

/**
 * Relabel host bind mounts with Docker's shared SELinux `:z` on enforcing
 * hosts. Named volumes, devices, and the docker socket are left alone.
 * Shared with tests. Preview/download compose stays unlabeled.
 */
export const SELINUX_BIND_MOUNTS_FN = String.raw`selinux_is_enforcing() {
    [ "$(cat /sys/fs/selinux/enforce 2>/dev/null)" = "1" ]
}

add_selinux_z_to_bind_mounts() {
    local compose="$1"
    [ -f "$compose" ] || return 1
    local tmp
    tmp=$(mktemp) || return 1
    if awk '
        function skip_src(s) {
            return (s ~ /^\/dev(\/|$)/) || (s ~ /^\/proc(\/|$)/) || (s ~ /^\/sys(\/|$)/) || (s ~ /^\/lib(64)?(\/|$)/) || (s == "/var/run/docker.sock") || (s == "/run/docker.sock")
        }
        function has_z(o) {
            return (o ~ /(^|,)[zZ]($|,)/)
        }
        {
            if ($0 !~ /^[[:space:]]+-[[:space:]]+/) { print; next }
            vol = $0
            sub(/^[[:space:]]+-[[:space:]]+/, "", vol)
            prefix = substr($0, 1, length($0) - length(vol))
            n = split(vol, p, ":")
            if (n < 2) { print; next }
            src = p[1]
            if (src !~ /^(\.\/|\.\.\/|\/|~\/)/ && src != "~") { print; next }
            if (skip_src(src)) { print; next }
            if (n == 2) {
                print prefix vol ":z"
                next
            }
            opts = p[3]
            i = 4
            while (i <= n) {
                opts = opts ":" p[i]
                i++
            }
            if (has_z(opts)) { print; next }
            print prefix p[1] ":" p[2] ":" opts ",z"
        }
    ' "$compose" > "$tmp"; then
        mv "$tmp" "$compose"
    else
        rm -f "$tmp"
        return 1
    fi
}`

/** Quiet commands tee to CMD_LOG; show_spinner dumps that log on failure. Shared with tests. */
export const RUN_CMD_FN = `init_cmd_log() {
    CMD_LOG=\$(mktemp /tmp/monero-suite-cmd.XXXXXX 2>/dev/null) || CMD_LOG="/tmp/monero-suite-cmd.log"
}

dump_cmd_log() {
    if [ -z "\${CMD_LOG:-}" ] || [ ! -s "\$CMD_LOG" ]; then
        return 0
    fi
    echo -e "\${GRAY}----- command output -----\${NC}"
    tail -n 80 "\$CMD_LOG"
    echo -e "\${GRAY}----- end (full log: \$CMD_LOG) -----\${NC}"
}

# Run a command, suppressing output unless verbose mode is enabled.
# stdin is /dev/null so piped curl|bash is never consumed by sudo/apt.
run_cmd() {
    if [ -n "\${CMD_LOG:-}" ]; then
        : > "\$CMD_LOG"
    fi
    if [ "\$VERBOSE" = true ]; then
        "\$@" </dev/null
    else
        if [ -n "\${CMD_LOG:-}" ]; then
            "\$@" > "\$CMD_LOG" 2>&1 </dev/null
        else
            "\$@" > /dev/null 2>&1 </dev/null
        fi
    fi
}

# Function to show spinner (quiet mode) or live output (verbose mode)
# Usage: show_spinner <pid> <message> [nofail]
# Pass "nofail" as 3rd arg to show a warning instead of exiting on failure
show_spinner() {
    local pid=\$1
    local message=\$2
    local nofail=\${3:-}
    local i=0
    local spin_len=\${#SPINNER}

    if [ "\$VERBOSE" = true ] || [ ! -t 1 ]; then
        printf "\${BLUE}[...]\${NC} %s\\n" "\$message"
        wait \$pid
    else
        while kill -0 \$pid 2>/dev/null; do
            i=\$(( (i + 1) % spin_len ))
            printf "\\r\${MONERO_ORANGE}[\${SPINNER:\$i:1}]\${NC} %s..." "\$message"
            sleep 0.1
        done
        wait \$pid
    fi

    local ret=\$?
    if [ "\$VERBOSE" != true ] && [ -t 1 ]; then
        printf "\\r\\033[2K"
    fi
    if [ \$ret -eq 0 ]; then
        printf "\${GREEN}[✓]\${NC} %s\\n" "\$message"
    elif [ "\$nofail" = "nofail" ]; then
        printf "\${YELLOW}[!]\${NC} %s\\n" "\$message"
        dump_cmd_log
    else
        printf "\${RED}[✗]\${NC} %s\\n" "\$message"
        dump_cmd_log
        echo -e "\${RED}Re-run with --verbose for live command output.\${NC}"
        exit 1
    fi
    return \$ret
}`

export const RUN_COMPOSE_FN = `run_compose() {
    if [ "\$VERBOSE" = true ] || [ -t 2 ]; then
        \$SUDO docker compose "\$@" </dev/null
    else
        \$SUDO docker compose --progress quiet "\$@" </dev/null
    fi
}`;

export const PRINT_INSTALL_HEADER_FN = `print_install_header() {
    if [ -t 1 ]; then
        local columns="\${COLUMNS:-$(tput cols 2>/dev/null || true)}"
        case "\$columns" in
            ''|*[!0-9]*) columns=80 ;;
        esac
        if [ "\$columns" -ge 92 ]; then
            echo -e "\$BANNER"
        fi
    fi
    echo -e "\${BLUE}Monero Suite Installation Script\${NC}"
    if [ -n "\$INSTALL_SERVICES" ]; then
        printf 'Services: %s\\n' "\$INSTALL_SERVICES"
    fi
    local blockchain=full
    if [ "\$IS_PRUNED_NODE" = true ]; then blockchain=pruned; fi
    printf 'Mode: %s | Blockchain: %s' "\$NETWORK_MODE" "\$blockchain"
    if [ "\$OFFLINE_MODE" = true ]; then printf ' | Offline'; fi
    printf '\\n'
    if [ "\$UPGRADE_SYSTEM_PACKAGES" = true ]; then
        echo 'System package upgrades enabled.'
    fi
    if [ "\$VERBOSE" = true ]; then
        echo -e "\${GRAY}Verbose mode enabled. Full command output will be shown.\${NC}"
    else
        echo -e "\${GRAY}Tip: Add --verbose to show full command output.\${NC}"
    fi
}`;

/** Refresh sudo while long steps (image pulls) run. Shared with tests. */
export const SUDO_KEEPALIVE_FN = `start_sudo_keepalive() {
    [ -n "\${SUDO:-}" ] || return 0
    (
        while true; do
            sleep "\${SUDO_KEEPALIVE_SLEEP:-60}"
            \$SUDO -n true >/dev/null 2>&1 || exit 0
        done
    ) &
    SUDO_KEEPALIVE_PID=\$!
}

stop_sudo_keepalive() {
    if [ -n "\${SUDO_KEEPALIVE_PID:-}" ]; then
        kill "\$SUDO_KEEPALIVE_PID" 2>/dev/null || true
        wait "\$SUDO_KEEPALIVE_PID" 2>/dev/null || true
        SUDO_KEEPALIVE_PID=""
    fi
}`

/** Prompt on /dev/tty before clobbering an existing compose/.env. Shared with tests. */
export const CONFIRM_OVERWRITE_FN = `confirm_overwrite_install_dir() {
    local compose="\$INSTALL_DIR/docker-compose.yml"
    local envfile="\$INSTALL_DIR/.env"
    if [ ! -f "\$compose" ] && [ ! -f "\$envfile" ]; then
        return 0
    fi
    echo -e "\${YELLOW}Existing install found at \$INSTALL_DIR\${NC}"
    echo -e "\${YELLOW}Continuing overwrites docker-compose.yml and .env. Docker volumes (blockchain, Grafana, etc.) are left alone.\${NC}"

    local tty="\${OVERWRITE_TTY:-/dev/tty}"
    if [ ! -e "\$tty" ] || [ ! -r "\$tty" ] || [ ! -w "\$tty" ]; then
        echo -e "\${YELLOW}No terminal to confirm; overwriting because this run is non-interactive.\${NC}"
        return 0
    fi
    printf "\${YELLOW}Overwrite and continue? [Y/n]: \${NC}"
    local reply=""
    if ! read -r reply < "\$tty"; then
        echo -e "\${RED}Could not read confirmation. Aborting.\${NC}"
        exit 1
    fi
    case "\$reply" in
        ""|Y|y|yes|YES) return 0 ;;
        *)
            echo -e "\${RED}Aborted. Existing files were not changed.\${NC}"
            exit 1
            ;;
    esac
}`

/** Warn when free space looks tight for the chain. Shared with tests. */
export const WARN_DISK_SPACE_FN = `warn_disk_space() {
    local need_gb="\$1"
    local kind="\$2"
    local path="\$3"

    case "\$path" in
        "")
            if command -v docker >/dev/null 2>&1; then
                path=\$(\$SUDO docker info --format '{{.DockerRootDir}}' 2>/dev/null || true)
            fi
            path=\${path:-\$INSTALL_HOME}
            ;;
        ~) path="\$INSTALL_HOME" ;;
        ~/*) path="\$INSTALL_HOME/\${path#~/}" ;;
    esac

    local probe="\$path"
    while [ ! -e "\$probe" ] && [ "\$probe" != "/" ] && [ -n "\$probe" ]; do
        probe=\$(dirname "\$probe")
    done
    [ -n "\$probe" ] || probe="/"

    local avail_kb
    avail_kb=\$(df -Pk "\$probe" 2>/dev/null | awk 'NR==2 {print \$4}')
    case "\$avail_kb" in
        ''|*[!0-9]*)
            echo -e "\${YELLOW}Could not measure free disk at \$probe. A \$kind node typically needs about \${need_gb} GiB.\${NC}"
            return 0
            ;;
    esac
    local avail_gb=\$((avail_kb / 1024 / 1024))
    if [ "\$avail_gb" -lt "\$need_gb" ]; then
        echo -e "\${YELLOW}Warning: \${avail_gb} GiB free at \$probe. A \$kind node typically needs about \${need_gb} GiB.\${NC}"
        echo -e "\${YELLOW}The installer will continue. Sync can fill the disk later.\${NC}"
    else
        echo -e "\${GREEN}[✓]\${NC} Disk space: \${avail_gb} GiB free at \$probe (about \${need_gb} GiB for a \$kind node)"
    fi
}`

/** Post-install status, access URLs, onions, sync note. Shared with tests. */
export const PRINT_NEXT_STEPS_FN = `print_tor_onions() {
    echo -e "\${BLUE}Tor hidden services:\${NC}"
    local attempt=0
    local out=""
    while [ "\$attempt" -lt 10 ]; do
        out=\$(\$SUDO docker compose exec -T tor sh -c 'for f in $(find /var/lib/tor -name hostname 2>/dev/null); do printf "%s: %s\\n" "$(basename "$(dirname "$f")")" "$(cat "$f")"; done' </dev/null 2>/dev/null) || out=""
        if [ -n "\$out" ]; then
            printf '%s\\n' "\$out" | sed 's/^/  /'
            return 0
        fi
        attempt=\$((attempt + 1))
        sleep 2
    done
    echo -e "  \${YELLOW}Addresses not ready yet. Run:\${NC} docker compose logs tor"
}

print_next_steps() {
    section "Next steps"
    \$SUDO docker compose ps </dev/null || true

    echo -e "\\n\${BLUE}Access:\${NC}"
__ACCESS_URLS__

    if [ "\$HAS_HIDDEN_SERVICES" = "true" ]; then
        echo
        print_tor_onions
    fi

    echo
    if [ "\$OFFLINE_MODE" = "true" ]; then
        echo -e "\${YELLOW}This node is in offline mode. It will not sync from the network.\${NC}"
    else
        echo -e "\${BLUE}Blockchain sync status was not checked. A first mainnet sync can take hours to days.\${NC}"
    fi

__SECRET_WARNINGS__

    if [ "\${PULL_FAILED:-false}" = "true" ] || [ "\${#FIREWALL_WARNINGS[@]}" -gt 0 ]; then
        echo -e "\\n\${YELLOW}Monero Suite installation completed with warnings.\${NC}"
        echo -e "\${YELLOW}Needs attention:\${NC}"
        if [ "\${PULL_FAILED:-false}" = "true" ]; then
            echo -e "  \${YELLOW}Image pull reported errors. Containers may be using older images already on disk.\${NC}"
        fi
        local warning
        for warning in "\${FIREWALL_WARNINGS[@]}"; do
            printf "  \${YELLOW}Firewall: %s\${NC}\\n" "\$warning"
        done
    else
        echo -e "\\n\${GREEN}Monero Suite installation completed.\${NC}"
    fi
    echo -e "Startup checks passed. Services without healthchecks were checked for running state.\\n"
    echo -e "\${BLUE}Useful commands:\${NC}"
    echo -e "  \${YELLOW}cd \$INSTALL_DIR\${NC}         — Change to the installation directory"
    echo -e "  \${YELLOW}docker compose ps\${NC}        — Check the status of the containers"
    echo -e "  \${YELLOW}docker compose logs -f\${NC}   — View container logs (exit with Ctrl+C)"
}`

/** Collect SSH listen ports from session, sockets, sshd -T, systemd, and config. Shared with tests. */
export const DETECT_SSH_PORTS_FN = `add_ssh_port() {
    local port="$1"
    case "$port" in
        ''|*[!0-9]*) return 1 ;;
    esac
    if [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
        return 1
    fi
    local existing
    for existing in "\${SSH_PORTS[@]}"; do
        if [ "$existing" = "$port" ]; then
            return 0
        fi
    done
    SSH_PORTS+=("$port")
    return 0
}

add_ssh_source() {
    local src="$1"
    case " \${SSH_SOURCES} " in
        *" $src "*) ;;
        *) SSH_SOURCES="\${SSH_SOURCES:+\$SSH_SOURCES }$src" ;;
    esac
}

add_port_from_ssh_connection() {
    local conn="$1"
    [ -n "$conn" ] || return
    local port
    port=$(printf '%s\\n' "$conn" | awk '{print $4}')
    add_ssh_port "$port" && add_ssh_source "session"
}

read_ssh_connection_from_proc() {
    local envfile="$1"
    [ -r "$envfile" ] || return 1
    tr '\\0' '\\n' < "$envfile" 2>/dev/null | grep -m1 '^SSH_CONNECTION=' | cut -d= -f2-
}

detect_ssh_ports_from_session() {
    add_port_from_ssh_connection "\${SSH_CONNECTION:-}"
    if [ -z "\${SSH_CONNECTION:-}" ]; then
        local proc_env="\${SSH_PROC_ENVIRON:-/proc/\$PPID/environ}"
        local parent_conn
        parent_conn=$(read_ssh_connection_from_proc "$proc_env") || parent_conn=""
        add_port_from_ssh_connection "$parent_conn"
    fi
}

detect_ssh_ports_from_listening() {
    command -v ss >/dev/null 2>&1 || return
    local ss_out=""
    ss_out=$($SUDO ss -tlnp 2>/dev/null) || ss_out=$(ss -tlnp 2>/dev/null) || ss_out=$(ss -tln 2>/dev/null) || ss_out=""
    [ -n "$ss_out" ] || return
    local line port
    while IFS= read -r line; do
        case "$line" in
            *sshd*|*dropbear*)
                port=$(printf '%s\\n' "$line" | awk '{print $4}' | sed -E 's/.*[.:]([0-9]+)\$/\\1/')
                add_ssh_port "$port" && add_ssh_source "listening"
                ;;
        esac
    done <<< "$ss_out"
}

detect_ssh_ports_from_sshd_t() {
    local sshd_bin=""
    if command -v sshd >/dev/null 2>&1; then
        sshd_bin=$(command -v sshd)
    elif [ -x /usr/sbin/sshd ]; then
        sshd_bin=/usr/sbin/sshd
    else
        return
    fi
    local out
    out=$($SUDO "$sshd_bin" -T 2>/dev/null) || out=""
    [ -n "$out" ] || return
    local port
    while IFS= read -r port; do
        [ -n "$port" ] || continue
        add_ssh_port "$port" && add_ssh_source "sshd_t"
    done < <(printf '%s\\n' "$out" | awk 'tolower(\$1)=="port" {print \$2}')
}

detect_ssh_ports_from_systemd() {
    command -v systemctl >/dev/null 2>&1 || return
    local unit_text
    unit_text=$($SUDO systemctl cat ssh.socket sshd.socket 2>/dev/null) || unit_text=""
    [ -n "$unit_text" ] || return
    local line trimmed val port
    while IFS= read -r line; do
        trimmed=\$(printf '%s\\n' "$line" | sed 's/^[[:space:]]*//')
        case "$trimmed" in
            ListenStream=*)
                val="\${trimmed#ListenStream=}"
                case "$val" in
                    /*) continue ;;
                esac
                port="\${val##*:}"
                add_ssh_port "$port" && add_ssh_source "systemd"
                ;;
        esac
    done <<< "$unit_text"
}

parse_ports_from_sshd_file() {
    local file="$1"
    [ -f "$file" ] || return
    local in_match=0
    local line trimmed val
    while IFS= read -r line || [ -n "$line" ]; do
        trimmed=\$(printf '%s\\n' "$line" | sed 's/^[[:space:]]*//')
        case "$trimmed" in
            ''|'#'*) continue ;;
            [Mm]atch|[Mm]atch[[:space:]]*)
                in_match=1
                continue
                ;;
        esac
        [ "$in_match" -eq 1 ] && continue
        case "$trimmed" in
            [Pp]ort[[:space:]]*)
                val=\$(printf '%s\\n' "$trimmed" | awk '{print \$2}')
                add_ssh_port "$val" && add_ssh_source "config"
                ;;
        esac
    done < "$file"
}

detect_ssh_ports_from_config() {
    local config_d="\${SSHD_CONFIG_D:-/etc/ssh/sshd_config.d}"
    local config="\${SSHD_CONFIG:-/etc/ssh/sshd_config}"
    if [ -d "$config_d" ]; then
        local conf
        for conf in "$config_d"/*.conf; do
            parse_ports_from_sshd_file "$conf"
        done
    fi
    parse_ports_from_sshd_file "$config"
}

detect_ssh_ports() {
    SSH_PORTS=()
    SSH_SOURCES=""
    detect_ssh_ports_from_session
    detect_ssh_ports_from_listening
    detect_ssh_ports_from_sshd_t
    detect_ssh_ports_from_systemd
    detect_ssh_ports_from_config
    if [ \${#SSH_PORTS[@]} -eq 0 ]; then
        SSH_SOURCES="none"
    fi
}`;

export const DOCKER_INSTALLATION_TEMPLATE = `#!/bin/bash

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
GRAY='\\033[0;90m'
MONERO_ORANGE='\\033[38;2;255;102;0m'
NC='\\033[0m' # No Color

# Verbose mode (pass -v or --verbose to enable)
VERBOSE=false
for arg in "$@"; do
    case "$arg" in
        -v|--verbose) VERBOSE=true ;;
    esac
done

# ASCII Art Banner
BANNER="
\${MONERO_ORANGE}███╗   ███╗ ██████╗ ███╗   ██╗███████╗██████╗  ██████╗ ███████╗██╗   ██╗██╗████████╗███████╗
████╗ ████║██╔═══██╗████╗  ██║██╔════╝██╔══██╗██╔═══██╗██╔════╝██║   ██║██║╚══██╔══╝██╔════╝
██╔████╔██║██║   ██║██╔██╗ ██║█████╗  ██████╔╝██║   ██║███████╗██║   ██║██║   ██║   █████╗
██║╚██╔╝██║██║   ██║██║╚██╗██║██╔══╝  ██╔══██╗██║   ██║╚════██║██║   ██║██║   ██║   ██╔══╝
██║ ╚═╝ ██║╚██████╔╝██║ ╚████║███████╗██║  ██║╚██████╔╝███████║╚██████╔╝██║   ██║   ███████╗
╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝   ╚═╝   ╚══════╝\${NC}"

# Progress animation characters
SPINNER="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"

${RUN_CMD_FN}

${RUN_COMPOSE_FN}

${PRINT_INSTALL_HEADER_FN}

# Print a section header
section() {
    echo -e "\n\${BLUE}--- $1 ---\${NC}\n"
}

${CHECK_PRIVILEGES_FN}

${RESOLVE_INSTALL_DIR_FN}

${RESOLVE_PKG_MANAGER_FN}

${SELINUX_BIND_MOUNTS_FN}

${SUDO_KEEPALIVE_FN}

${CONFIRM_OVERWRITE_FN}

${WARN_DISK_SPACE_FN}

${PRINT_NEXT_STEPS_FN}

# Function to detect OS and package manager
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        echo -e "\${RED}Error: Cannot detect OS\${NC}"
        exit 1
    fi

    resolve_pkg_manager "$OS" "\${ID_LIKE:-}"
    echo -e "\${GREEN}[✓]\${NC} Detected OS: $OS (package manager: $PKG_MANAGER)"
}

# Function to detect network environment
detect_network() {
    local is_public=false
    for ip in $(hostname -I 2>/dev/null); do
        case "$ip" in
            10.*|172.1[6-9].*|172.2[0-9].*|172.3[0-1].*|192.168.*|fd*|fe80:*) ;;
            *) is_public=true ;;
        esac
    done
    if [ "$is_public" = true ]; then
        DETECTED_NETWORK="exposed"
    else
        DETECTED_NETWORK="local"
    fi
}

# Function to validate network mode against user configuration
validate_network() {
    detect_network
    if [ "$NETWORK_MODE" = "exposed" ] && [ "$DETECTED_NETWORK" = "local" ]; then
        echo -e "\${YELLOW}Warning: You configured Monero Suite for a VPS/exposed server, but this machine appears to be behind NAT (no public IP detected)."
        echo -e "If this is incorrect, reconfigure at monerosuite.org with 'Local Network' mode.\${NC}\n"
    elif [ "$NETWORK_MODE" = "local" ] && [ "$DETECTED_NETWORK" = "exposed" ]; then
        echo -e "\${YELLOW}Warning: You configured Monero Suite for a local/home server, but this machine appears to have a public IP."
        echo -e "Services may be unintentionally exposed to the internet without firewall rules."
        echo -e "If this is incorrect, reconfigure at monerosuite.org with 'VPS/exposed' mode.\${NC}\n"
    fi
}

# Distro-agnostic package helpers
pkg_update() {
    case "$PKG_MANAGER" in
        apt) $SUDO apt-get update ;;
        dnf) $SUDO dnf makecache ;;
        yum) $SUDO yum makecache ;;
    esac
}

pkg_upgrade() {
    case "$PKG_MANAGER" in
        apt) ${APT_UPGRADE_ENV} $SUDO ${APT_UPGRADE_BIN} ;;
        dnf) $SUDO ${DNF_UPGRADE_BIN} ;;
        yum) $SUDO ${YUM_UPGRADE_BIN} ;;
    esac
}

pkg_install() {
    case "$PKG_MANAGER" in
        apt) $SUDO apt-get install -y "$@" ;;
        dnf) $SUDO dnf install -y "$@" ;;
        yum) $SUDO yum install -y "$@" ;;
    esac
}

${DETECT_SSH_PORTS_FN}

# Run a firewall command in the foreground. Do not swallow failures.
fw_cmd() {
    echo -e "\${GRAY}$*\${NC}"
    $SUDO "$@"
}

ufw_is_active() {
    $SUDO ufw status 2>/dev/null | grep -qi '^Status:[[:space:]]*active'
}

ufw_port_allowed() {
    local port="\$1"
    if $SUDO ufw show added 2>/dev/null | grep -Eq "allow[[:space:]]+\$port/tcp"; then
        return 0
    fi
    if $SUDO ufw status 2>/dev/null | grep -Eq "(^|[[:space:]])\$port/tcp"; then
        return 0
    fi
    return 1
}

ufw_allow_docker_forward() {
    local ufw_default="/etc/default/ufw"
    [ -f "\$ufw_default" ] || return 0
    if grep -Eq '^DEFAULT_FORWARD_POLICY="ACCEPT"' "\$ufw_default"; then
        return 0
    fi
    echo -e "\${GRAY}Setting DEFAULT_FORWARD_POLICY=ACCEPT in \$ufw_default (Docker published ports)\${NC}"
    $SUDO sed -i -E 's/^DEFAULT_FORWARD_POLICY=.*/DEFAULT_FORWARD_POLICY="ACCEPT"/' "\$ufw_default"
}

firewalld_is_running() {
    $SUDO firewall-cmd --state 2>/dev/null | grep -qx running
}

warn_firewall() {
    FIREWALL_WARNINGS+=("\$1")
    echo -e "\${YELLOW}Warning: \$1\${NC}"
}

skip_firewall() {
    warn_firewall "\$1"
    echo -e "\${YELLOW}Skipping host firewall enable. Services will still start. Configure the firewall by hand if needed.\${NC}"
}

setup_firewall_ufw() {
    local ports=("\$@")
    local port
    local ufw_was_active=false
    if ufw_is_active; then
        ufw_was_active=true
        echo -e "\${GRAY}ufw is already active; adding rules only (not changing default policy)\${NC}"
    fi

    for port in "\${SSH_PORTS[@]}"; do
        echo -e "\${GRAY}Allowing SSH on port \$port/tcp\${NC}"
        if ! fw_cmd ufw allow "\$port/tcp"; then
            skip_firewall "Failed to allow SSH port \$port/tcp"
            return 0
        fi
    done

    for port in "\${SSH_PORTS[@]}"; do
        if ! ufw_port_allowed "\$port"; then
            skip_firewall "SSH port \$port/tcp is not in the ufw rule list"
            return 0
        fi
    done

    for port in "\${ports[@]}"; do
        echo -e "\${GRAY}Allowing port \$port\${NC}"
        fw_cmd ufw allow "\$port" || warn_firewall "Failed to allow \$port in ufw"
    done

    if ! ufw_allow_docker_forward; then
        skip_firewall "Failed to configure ufw forwarding for Docker"
        return 0
    fi

    if [ "\$ufw_was_active" = true ]; then
        if [ "\${#FIREWALL_WARNINGS[@]}" -eq 0 ]; then
            echo -e "\${GREEN}[✓] ufw rules updated (SSH ports \${SSH_PORTS[*]})\${NC}"
        else
            echo -e "\${YELLOW}[!] ufw rules updated with warnings\${NC}"
        fi
        return 0
    fi

    echo -e "\${GRAY}Setting default policy: deny incoming, allow outgoing\${NC}"
    if ! fw_cmd ufw default deny incoming; then
        skip_firewall "Failed to set ufw default deny incoming"
        return 0
    fi
    if ! fw_cmd ufw default allow outgoing; then
        skip_firewall "Failed to set ufw default allow outgoing"
        return 0
    fi

    echo -e "\${GRAY}Enabling ufw\${NC}"
    if ! fw_cmd ufw --force enable; then
        skip_firewall "Failed to enable ufw"
        return 0
    fi

    for port in "\${SSH_PORTS[@]}"; do
        if ! ufw_port_allowed "\$port"; then
            echo -e "\${YELLOW}SSH port \$port/tcp missing after enable; disabling ufw to avoid lockout\${NC}"
            $SUDO ufw disable
            skip_firewall "ufw rolled back (disabled)"
            return 0
        fi
    done

    if [ "\${#FIREWALL_WARNINGS[@]}" -eq 0 ]; then
        echo -e "\${GREEN}[✓] Firewall configured successfully\${NC}"
    else
        echo -e "\${YELLOW}[!] Firewall configured with warnings\${NC}"
    fi
}

setup_firewall_firewalld() {
    local ports=("\$@")
    local port

    if ! firewalld_is_running; then
        skip_firewall "firewalld is installed but not running"
        return 0
    fi

    for port in "\${SSH_PORTS[@]}"; do
        echo -e "\${GRAY}Allowing SSH on port \$port/tcp\${NC}"
        if ! fw_cmd firewall-cmd --permanent --add-port="\$port/tcp"; then
            skip_firewall "Failed to allow SSH port \$port/tcp in firewalld"
            return 0
        fi
    done

    for port in "\${SSH_PORTS[@]}"; do
        if ! $SUDO firewall-cmd --permanent --query-port="\$port/tcp" >/dev/null 2>&1; then
            skip_firewall "SSH port \$port/tcp is not in the firewalld permanent rules"
            return 0
        fi
    done

    for port in "\${ports[@]}"; do
        echo -e "\${GRAY}Allowing port \$port\${NC}"
        fw_cmd firewall-cmd --permanent --add-port="\$port" || warn_firewall "Failed to allow \$port in firewalld"
    done

    echo -e "\${GRAY}Reloading firewalld\${NC}"
    if ! fw_cmd firewall-cmd --reload; then
        skip_firewall "Failed to reload firewalld"
        return 0
    fi

    for port in "\${SSH_PORTS[@]}"; do
        if ! $SUDO firewall-cmd --query-port="\$port/tcp" >/dev/null 2>&1; then
            skip_firewall "SSH port \$port/tcp missing after firewalld reload"
            return 0
        fi
    done

    if [ "\${#FIREWALL_WARNINGS[@]}" -eq 0 ]; then
        echo -e "\${GREEN}[✓] Firewall configured successfully\${NC}"
    else
        echo -e "\${YELLOW}[!] Firewall configured with warnings\${NC}"
    fi
}

# Firewall setup (auto-detects ufw vs firewalld)
setup_firewall() {
    local ports=("\$@")

    section "Firewall Configuration"

    detect_ssh_ports

    if [ \${#SSH_PORTS[@]} -eq 0 ]; then
        warn_firewall "SSH port could not be confirmed (no live session, listener, sshd -T, systemd socket, or Port in sshd_config)."
        echo -e "\${YELLOW}Skipping host firewall enable so we do not block SSH. Configure it by hand, for example:\${NC}"
        echo -e "  \${GRAY}ufw allow <ssh-port>/tcp && ufw --force enable\${NC}"
        echo -e "  \${GRAY}firewall-cmd --permanent --add-port=<ssh-port>/tcp && firewall-cmd --reload\${NC}"
        return 0
    fi

    echo -e "\${GREEN}[✓]\${NC} SSH on TCP ports: \${SSH_PORTS[*]} (\${SSH_SOURCES})"

    local fw_tool=""
    if command -v ufw &> /dev/null; then
        fw_tool="ufw"
    elif command -v firewall-cmd &> /dev/null; then
        fw_tool="firewalld"
    else
        skip_firewall "No supported firewall found (ufw or firewalld). Please configure your firewall manually."
        return 0
    fi

    echo -e "Detected firewall tool: \${GREEN}\${fw_tool}\${NC}"

    if [ "\$fw_tool" = "ufw" ]; then
        setup_firewall_ufw "\${ports[@]}"
    else
        setup_firewall_firewalld "\${ports[@]}"
    fi
}

# Function to install Docker using convenience script
install_docker() {
    section "Docker Installation"

    # Skip if Docker is already installed and working
    if docker --version > /dev/null 2>&1 && docker compose version > /dev/null 2>&1; then
        echo -e "\${GREEN}[✓] Docker is already installed:\${NC} $(docker --version)"
        # Still ensure the service is enabled
        run_cmd $SUDO systemctl enable --now docker &
        show_spinner $! "Ensuring Docker service is enabled"
        return
    fi

    echo -e "Installing Docker via the official convenience script (https://get.docker.com)."
    echo -e "This will install: Docker Engine, Docker CLI, containerd, and Docker Compose plugin."
    echo -e "This can take several minutes.\\n"

    run_cmd curl -fsSL https://get.docker.com -o /tmp/get-docker.sh &
    show_spinner $! "Downloading Docker install script from get.docker.com"

    run_cmd $SUDO sh /tmp/get-docker.sh &
    show_spinner $! "Installing Docker Engine, CLI, containerd, and Compose plugin"

    rm -f /tmp/get-docker.sh

    # Ensure Docker daemon is started and enabled on boot
    run_cmd $SUDO systemctl enable --now docker &
    show_spinner $! "Enabling Docker service to start on boot"

    if [ -n "$SUDO" ]; then
        if ! getent group docker > /dev/null; then
            run_cmd $SUDO groupadd docker &
            show_spinner $! "Creating docker group"
        fi
        run_cmd $SUDO usermod -aG docker $USER &
        show_spinner $! "Adding user '$USER' to docker group"
        echo -e "\n\${YELLOW}Note: \$USER was added to the docker group. This script keeps using sudo for docker, so you can continue now. Log out and back in later if you want to run docker without sudo.\${NC}"
    fi

    if docker --version > /dev/null 2>&1; then
        echo -e "\n\${GREEN}[✓] Docker installed successfully:\${NC} $(docker --version)"
    else
        echo -e "\n\${RED}Docker installation failed. Re-run with --verbose for details.\${NC}"
        exit 1
    fi
}

# Main execution
init_cmd_log
FIREWALL_WARNINGS=()
trap 'stop_sudo_keepalive' EXIT

NETWORK_MODE="\${NETWORK_MODE_PLACEHOLDER}"
INSTALL_SERVICES=\${INSTALL_SERVICES_PLACEHOLDER}
FIREWALL_PORTS="\${FIREWALL_PORTS_PLACEHOLDER}"
UPGRADE_SYSTEM_PACKAGES="\${UPGRADE_SYSTEM_PACKAGES_PLACEHOLDER}"
HAS_HIDDEN_SERVICES="\${HAS_HIDDEN_SERVICES_PLACEHOLDER}"
OFFLINE_MODE="\${OFFLINE_MODE_PLACEHOLDER}"
IS_PRUNED_NODE="\${IS_PRUNED_NODE_PLACEHOLDER}"
BLOCKCHAIN_PATH=\${BLOCKCHAIN_PATH_PLACEHOLDER}
PRUNED_DISK_GB="\${PRUNED_DISK_GB_PLACEHOLDER}"
FULL_DISK_GB="\${FULL_DISK_GB_PLACEHOLDER}"

print_install_header

section "System Checks"
check_privileges
start_sudo_keepalive
resolve_install_dir
detect_os
validate_network

run_cmd pkg_update &
show_spinner $! "Refreshing package indexes"

if [ "$UPGRADE_SYSTEM_PACKAGES" = "true" ]; then
    run_cmd pkg_upgrade &
    show_spinner $! "Upgrading existing packages"
fi

run_cmd pkg_install curl &
show_spinner $! "Installing packages: curl"

install_docker
`;

export const SETUP_TEMPLATE = `
# Function to setup Monero Suite
setup_monero_suite() {
    section "Monero Suite Setup"
    echo -e "Installing to \${BLUE}$INSTALL_DIR\${NC}\\n"

    confirm_overwrite_install_dir

    if [ "\$IS_PRUNED_NODE" = "true" ]; then
        warn_disk_space "\$PRUNED_DISK_GB" "pruned" "\$BLOCKCHAIN_PATH"
    else
        warn_disk_space "\$FULL_DISK_GB" "full" "\$BLOCKCHAIN_PATH"
    fi

    # Create installation directory
    run_cmd mkdir -p "$INSTALL_DIR" &
    show_spinner $! "Creating directory $INSTALL_DIR"

    # Write Docker Compose file
    if ! cat > "$INSTALL_DIR"/docker-compose.yml << 'MONERO_COMPOSE_EOF'
\${DOCKER_COMPOSE_CONTENT}
MONERO_COMPOSE_EOF
    then
        printf "\${RED}[✗]\${NC} Writing docker-compose.yml to %s\\n" "$INSTALL_DIR"
        exit 1
    fi
    echo -e "\${GREEN}[✓]\${NC} Writing docker-compose.yml"

    # Expand ~/ in bind-mount sources to the install home (effective uid).
    # Compose later runs under $SUDO, which would otherwise resolve ~ to /root.
    if [ -n "$INSTALL_HOME" ] && grep -Eq '[:[:space:]]~/' "$INSTALL_DIR"/docker-compose.yml; then
        if ! sed -i.bak -E "s|([:[:space:]])~/|\\1\${INSTALL_HOME}/|g" "$INSTALL_DIR"/docker-compose.yml; then
            printf "\${RED}[✗]\${NC} Expanding ~/ paths in docker-compose.yml\\n"
            exit 1
        fi
        rm -f "$INSTALL_DIR"/docker-compose.yml.bak
        echo -e "\${GREEN}[✓]\${NC} Expanding ~/ paths in docker-compose.yml"
    fi

    if selinux_is_enforcing; then
        if ! add_selinux_z_to_bind_mounts "$INSTALL_DIR"/docker-compose.yml; then
            printf "\${RED}[✗]\${NC} Labeling host bind mounts for SELinux\\n"
            exit 1
        fi
        echo -e "\${GREEN}[✓]\${NC} Labeling host bind mounts for SELinux"
    fi
`;


export const ENV_FILE_TEMPLATE = `
    # Write environment file
    if ! cat > "$INSTALL_DIR"/.env << 'MONERO_ENV_EOF'
\${ENV_CONTENT}
MONERO_ENV_EOF
    then
        printf "\${RED}[✗]\${NC} Writing .env configuration to %s\\n" "$INSTALL_DIR"
        exit 1
    fi
    echo -e "\${GREEN}[✓]\${NC} Writing .env configuration"
`;

export const COMPLETION_TEMPLATE = `

    # Configure firewall if in exposed mode
    if [ "$NETWORK_MODE" = "exposed" ] && [ -n "\${FIREWALL_PORTS:-}" ]; then
        setup_firewall $FIREWALL_PORTS
    fi

    section "Starting Services"
    cd "$INSTALL_DIR"

    echo -e "Pulling container images (this can take several minutes)..."
    PULL_FAILED=false
    if run_compose pull; then
        echo -e "\${GREEN}[✓]\${NC} Pulling container images"
    else
        echo -e "\${YELLOW}[!] Image pull failed. Trying to start with images already on disk.\${NC}"
        PULL_FAILED=true
    fi

    echo -e "Starting Monero Suite containers and waiting up to 120s for startup checks..."
    if run_compose up -d --wait --wait-timeout 120; then
        echo -e "\${GREEN}[✓]\${NC} Container startup checks passed"
    else
        echo -e "\${RED}[✗]\${NC} Container startup checks failed"
        $SUDO docker compose ps </dev/null || true
        $SUDO docker compose logs --tail=80 </dev/null || true
        echo -e "\${RED}Re-run with --verbose if the logs above are not enough.\${NC}"
        exit 1
    fi

    print_next_steps
}

setup_monero_suite
`;
