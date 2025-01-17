const installationPath = "~/monero-suite";

export const DOCKER_INSTALLATION_TEMPLATE = `#!/bin/bash

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
MONERO_ORANGE='\\033[38;2;255;102;0m'
NC='\\033[0m' # No Color

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

# Function to show spinner
show_spinner() {
    local pid=$1
    local message=$2
    local i=0
    local spin_len=\${#SPINNER}

    while kill -0 $pid 2>/dev/null; do
        i=$(( (i + 1) % spin_len ))
        printf "\r\${MONERO_ORANGE}[\${SPINNER:$i:1}]\${NC} %s..." "$message"
        sleep 0.1
    done
    wait $pid
    local ret=$?
    echo -en "\r"
    if [ $ret -eq 0 ]; then
        printf "\${GREEN}[✓]\${NC} %s\n" "$message"
    else
        printf "\${RED}[✗]\${NC} %s\n" "$message"
        exit 1
    fi
    return $ret
}

# Function to check if running as root or with sudo
check_privileges() {
    if [ "$EUID" -ne 0 ]; then
        if ! command -v sudo &> /dev/null; then
            echo -e "\${RED}Error: This script requires root privileges. Please run as root or install sudo.\${NC}"
            exit 1
        fi
        SUDO="sudo"
    else
        SUDO=""
    fi
}

# Function to detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION_CODENAME=$VERSION_CODENAME
    else
        echo -e "\${RED}Error: Cannot detect OS\${NC}"
        exit 1
    fi
}

# Function to install Docker
install_docker() {
    echo -e "\${BLUE}Starting Docker installation...\${NC}\n"

    # Update package index
    $SUDO apt-get update > /dev/null 2>&1 &
    show_spinner $! "Updating package index"

    # Install prerequisites
    $SUDO apt-get install -y ca-certificates curl > /dev/null 2>&1 &
    show_spinner $! "Installing prerequisites"

    # Setup Docker repository
    $SUDO install -m 0755 -d /etc/apt/keyrings > /dev/null 2>&1 &
    show_spinner $! "Creating keyrings directory"

    if [ "$OS" = "ubuntu" ]; then
        $SUDO curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc > /dev/null 2>&1 &
    else
        $SUDO curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc > /dev/null 2>&1 &
    fi
    show_spinner $! "Adding Docker's GPG key"

    $SUDO chmod a+r /etc/apt/keyrings/docker.asc > /dev/null 2>&1 &
    show_spinner $! "Setting GPG key permissions"

    # Add Docker repository
    if [ "$OS" = "ubuntu" ]; then
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \${VERSION_CODENAME} stable" | \
        $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
    else
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \${VERSION_CODENAME} stable" | \
        $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
    fi
    show_spinner $! "Adding Docker repository"

    # Update package index again
    $SUDO apt-get update > /dev/null 2>&1 &
    show_spinner $! "Updating package index with Docker repository"

    # Install Docker
    $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin > /dev/null 2>&1 &
    show_spinner $! "Installing Docker packages"

    # Post-installation steps for non-root user
    if [ -n "$SUDO" ]; then
        # Create docker group if it doesn't exist
        if ! getent group docker > /dev/null; then
            $SUDO groupadd docker > /dev/null 2>&1 &
            show_spinner $! "Creating docker group"
        fi

        # Add current user to docker group
        $SUDO usermod -aG docker $USER > /dev/null 2>&1 &
        show_spinner $! "Adding current user to docker group"
        
        echo -e "\n\${YELLOW}Note: Please log out and log back in for docker group changes to take effect.\${NC}"
    fi

    # Verify installation
    if docker --version > /dev/null 2>&1; then
        echo -e "\n\${GREEN}Docker was successfully installed!\${NC}"
        docker --version
    else
        echo -e "\n\${RED}Docker installation seems to have failed. Please check the logs.\${NC}"
        exit 1
    fi
}

# Main execution
echo -e "$BANNER"
echo -e "\n\${BLUE}Docker Installation Script\${NC}\n"

check_privileges
detect_os

if [ "$OS" != "ubuntu" ] && [ "$OS" != "debian" ]; then
    echo -e "\${RED}Error: This script only supports Ubuntu and Debian.\${NC}"
    exit 1
fi

install_docker 
`;

export const SETUP_TEMPLATE = `
# Function to setup Monero Suite
setup_monero_suite() {
    echo -e "\${BLUE}Setting up Monero Suite...\${NC}\n"

    # Create installation directory
    mkdir -p ${installationPath} > /dev/null 2>&1 &
    show_spinner $! "Creating installation directory"

    # Download Docker Compose file
    wget -q -O ${installationPath}/docker-compose.yml \${DOCKER_COMPOSE_URL} > /dev/null 2>&1 &
    show_spinner $! "Downloading Docker Compose configuration"
`;

export const ENV_FILE_TEMPLATE = `
    # Download environment file
    wget -q -O ${installationPath}/.env \${ENV_FILE_URL} > /dev/null 2>&1 &
    show_spinner $! "Downloading environment configuration"
`;

export const COMPLETION_TEMPLATE = `

    # Start Docker Compose
    cd ${installationPath}
    docker compose up -d > /dev/null 2>&1 &
    show_spinner $! "Starting Monero Suite containers"

    echo -e "\\n\${GREEN}Monero Suite installation completed successfully!\${NC}"
    echo -e "\${BLUE}Useful commands:\${NC}"
    echo -e "\${YELLOW}cd ${installationPath}\${NC} : Change to the installation directory"
    echo -e "\${YELLOW}docker compose ps\${NC} : Check the status of the containers"
    echo -e "\${YELLOW}docker compose logs -f\${NC} : View container logs (exit with Ctrl+C)"
}

# Main execution
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    setup_monero_suite
else
    echo -e "\${RED}Error: This script only supports Ubuntu and Debian.\${NC}"
    exit 1
fi
`;
