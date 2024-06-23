export const installDockerForUbuntu = `# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Docker is installed
if ! command_exists docker; then
    echo "Docker is not installed. Installing Docker..."

    # Update package information
    sudo apt-get update

    # Install necessary packages for installation
    sudo apt-get install -y ca-certificates curl

    # Create the keyrings directory
    sudo install -m 0755 -d /etc/apt/keyrings

    # Download Docker's official GPG key
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add Docker's official repository to Apt sources
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Update package information again with the new repository
    sudo apt-get update

    # Install Docker
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    echo "Docker installed successfully."

    sudo groupadd docker
    sudo usermod -aG docker $USER
    newgrp docker
else
    echo "Docker is already installed."
fi

# Check if Docker Compose is installed
if ! command_exists docker compose; then
    echo "Docker Compose is not installed. Installing Docker Compose..."

    # Download the latest version of Docker Compose
    sudo apt-get install docker-compose-plugin

    echo "Docker Compose installed successfully."
else
    echo "Docker Compose is already installed."
fi
`;
