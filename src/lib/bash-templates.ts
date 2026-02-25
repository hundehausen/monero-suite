const installationPath = "~/monero-suite";

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

# Run a command, suppressing output unless verbose mode is enabled
run_cmd() {
    if [ "$VERBOSE" = true ]; then
        "$@"
    else
        "$@" > /dev/null 2>&1
    fi
}

# Function to show spinner (quiet mode) or live output (verbose mode)
# Usage: show_spinner <pid> <message> [nofail]
# Pass "nofail" as 3rd arg to show a warning instead of exiting on failure
show_spinner() {
    local pid=$1
    local message=$2
    local nofail=\${3:-}
    local i=0
    local spin_len=\${#SPINNER}

    if [ "$VERBOSE" = true ]; then
        printf "\${BLUE}[...]\${NC} %s\n" "$message"
        wait $pid
    else
        while kill -0 $pid 2>/dev/null; do
            i=$(( (i + 1) % spin_len ))
            printf "\r\${MONERO_ORANGE}[\${SPINNER:$i:1}]\${NC} %s..." "$message"
            sleep 0.1
        done
        wait $pid
    fi

    local ret=$?
    printf "\r\x1b[2K"
    if [ $ret -eq 0 ]; then
        printf "\${GREEN}[✓]\${NC} %s\n" "$message"
    elif [ "$nofail" = "nofail" ]; then
        printf "\${YELLOW}[!]\${NC} %s\n" "$message"
    else
        printf "\${RED}[✗]\${NC} %s\n" "$message"
        exit 1
    fi
    return $ret
}

# Print a section header
section() {
    echo -e "\n\${BLUE}--- $1 ---\${NC}\n"
}

# Function to check if running as root or with sudo
check_privileges() {
    if [ "$EUID" -ne 0 ]; then
        if ! command -v sudo &> /dev/null; then
            echo -e "\${RED}Error: This script requires root privileges. Please run as root or install sudo.\${NC}"
            exit 1
        fi
        SUDO="sudo"
        echo -e "\${GREEN}[✓]\${NC} sudo is available"
    else
        SUDO=""
        echo -e "\${GREEN}[✓]\${NC} Running as root"
    fi
}

# Function to detect OS and package manager
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION_CODENAME=\${VERSION_CODENAME:-}
    else
        echo -e "\${RED}Error: Cannot detect OS\${NC}"
        exit 1
    fi

    case "$OS" in
        ubuntu|debian) PKG_MANAGER="apt" ;;
        fedora)        PKG_MANAGER="dnf" ;;
        centos|rhel|rocky|almalinux) PKG_MANAGER="dnf" ;;
        *)
            echo -e "\${RED}Error: Unsupported OS '$OS'. Supported: Ubuntu, Debian, Fedora, CentOS, Rocky, AlmaLinux, RHEL.\${NC}"
            exit 1
            ;;
    esac

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
        apt) $SUDO apt-get update && $SUDO apt-get upgrade -y ;;
        dnf) $SUDO dnf upgrade -y ;;
    esac
}

pkg_install() {
    case "$PKG_MANAGER" in
        apt) $SUDO apt-get install -y "$@" ;;
        dnf) $SUDO dnf install -y "$@" ;;
    esac
}

# Detect SSH port from sshd configuration
detect_ssh_port() {
    local ssh_port=""

    # Check sshd_config.d drop-in files first (takes precedence on modern systems)
    if [ -d /etc/ssh/sshd_config.d ]; then
        for conf in /etc/ssh/sshd_config.d/*.conf; do
            if [ -f "$conf" ]; then
                local p=$(grep -Ei '^\\s*Port\\s+' "$conf" 2>/dev/null | awk '{print $2}' | tail -1)
                if [ -n "$p" ]; then
                    ssh_port=$p
                fi
            fi
        done
    fi

    # Fall back to main sshd_config
    if [ -z "$ssh_port" ] && [ -f /etc/ssh/sshd_config ]; then
        ssh_port=$(grep -Ei '^\\s*Port\\s+' /etc/ssh/sshd_config 2>/dev/null | awk '{print $2}' | tail -1)
    fi

    echo "\${ssh_port:-22}"
}

# Firewall setup (auto-detects ufw vs firewalld)
setup_firewall() {
    local ports=("$@")

    local fw_tool=""
    if command -v ufw &> /dev/null; then
        fw_tool="ufw"
    elif command -v firewall-cmd &> /dev/null; then
        fw_tool="firewalld"
    else
        echo -e "\${YELLOW}Warning: No supported firewall found (ufw or firewalld). Please configure your firewall manually.\${NC}"
        return
    fi

    section "Firewall Configuration"
    echo -e "Detected firewall tool: \${GREEN}\${fw_tool}\${NC}"

    # Detect SSH port and ask user
    local ssh_port=$(detect_ssh_port)
    echo ""
    read -r -p "$(echo -e "\${YELLOW}Detected SSH on port \${ssh_port}. Add firewall rule to allow it? [Y/n]: \${NC}")" allow_ssh
    allow_ssh=\${allow_ssh:-Y}

    if [ "$fw_tool" = "ufw" ]; then
        echo -e "\${GRAY}Setting default policy: deny incoming, allow outgoing\${NC}"
        run_cmd $SUDO ufw default deny incoming
        run_cmd $SUDO ufw default allow outgoing
        if [[ ! "\${allow_ssh}" =~ ^[Nn]$ ]]; then
            echo -e "\${GRAY}Allowing SSH on port \${ssh_port}/tcp\${NC}"
            run_cmd $SUDO ufw allow "\${ssh_port}/tcp"
        fi
        for port in "\${ports[@]}"; do
            echo -e "\${GRAY}Allowing port $port\${NC}"
            run_cmd $SUDO ufw allow "$port"
        done
        echo -e "\${GRAY}Enabling ufw\${NC}"
        run_cmd $SUDO ufw --force enable
    elif [ "$fw_tool" = "firewalld" ]; then
        if [[ ! "\${allow_ssh}" =~ ^[Nn]$ ]]; then
            if [ "\${ssh_port}" = "22" ]; then
                echo -e "\${GRAY}Allowing SSH service\${NC}"
                run_cmd $SUDO firewall-cmd --permanent --add-service=ssh
            else
                echo -e "\${GRAY}Allowing SSH on port \${ssh_port}/tcp\${NC}"
                run_cmd $SUDO firewall-cmd --permanent --add-port="\${ssh_port}/tcp"
            fi
        fi
        for port in "\${ports[@]}"; do
            echo -e "\${GRAY}Allowing port $port\${NC}"
            run_cmd $SUDO firewall-cmd --permanent --add-port="$port"
        done
        echo -e "\${GRAY}Reloading firewalld\${NC}"
        run_cmd $SUDO firewall-cmd --reload
    fi

    echo -e "\${GREEN}[✓] Firewall configured successfully\${NC}"
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
    echo -e "This will install: Docker Engine, Docker CLI, containerd, and Docker Compose plugin.\n"

    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh > /dev/null 2>&1 &
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
        echo -e "\n\${YELLOW}Note: Please log out and log back in for docker group changes to take effect.\${NC}"
    fi

    if docker --version > /dev/null 2>&1; then
        echo -e "\n\${GREEN}[✓] Docker installed successfully:\${NC} $(docker --version)"
    else
        echo -e "\n\${RED}Docker installation failed. Re-run with --verbose for details.\${NC}"
        exit 1
    fi
}

# Main execution
echo -e "$BANNER"
echo -e "\n\${BLUE}Monero Suite Installation Script\${NC}"
if [ "$VERBOSE" = true ]; then
    echo -e "\${GRAY}Verbose mode enabled — full command output will be shown.\${NC}"
fi
echo -e "\${GRAY}Tip: For verbose output, use: curl -sSL <url> | bash -s -- --verbose\${NC}\n"

NETWORK_MODE="\${NETWORK_MODE_PLACEHOLDER}"
FIREWALL_PORTS="\${FIREWALL_PORTS_PLACEHOLDER}"

section "System Checks"
check_privileges
detect_os
validate_network

run_cmd pkg_update &
show_spinner $! "Updating system packages"

run_cmd pkg_install curl &
show_spinner $! "Installing packages: curl"

install_docker
`;

export const SETUP_TEMPLATE = `
# Function to setup Monero Suite
setup_monero_suite() {
    section "Monero Suite Setup"
    echo -e "Installing to \${BLUE}${installationPath}\${NC}\n"

    # Create installation directory
    mkdir -p ${installationPath} > /dev/null 2>&1 &
    show_spinner $! "Creating directory ${installationPath}"

    # Write Docker Compose file
    cat > ${installationPath}/docker-compose.yml << 'MONERO_COMPOSE_EOF'
\${DOCKER_COMPOSE_CONTENT}
MONERO_COMPOSE_EOF
    echo -e "\${GREEN}[✓]\${NC} Writing docker-compose.yml"
`;

export const ENV_FILE_TEMPLATE = `
    # Write environment file
    cat > ${installationPath}/.env << 'MONERO_ENV_EOF'
\${ENV_CONTENT}
MONERO_ENV_EOF
    echo -e "\${GREEN}[✓]\${NC} Writing .env configuration"
`;

export const COMPLETION_TEMPLATE = `

    # Configure firewall if in exposed mode
    if [ "$NETWORK_MODE" = "exposed" ] && [ -n "\${FIREWALL_PORTS:-}" ]; then
        setup_firewall $FIREWALL_PORTS
    fi

    section "Starting Services"
    cd ${installationPath}

    run_cmd docker compose pull &
    show_spinner $! "Pulling container images" nofail

    run_cmd docker compose up -d &
    show_spinner $! "Starting Monero Suite containers" nofail

    echo -e "\\n\${GREEN}Monero Suite installation completed successfully!\${NC}\n"
    echo -e "\${BLUE}Useful commands:\${NC}"
    echo -e "  \${YELLOW}cd ${installationPath}\${NC}         — Change to the installation directory"
    echo -e "  \${YELLOW}docker compose ps\${NC}        — Check the status of the containers"
    echo -e "  \${YELLOW}docker compose logs -f\${NC}   — View container logs (exit with Ctrl+C)"
}

setup_monero_suite
`;
