import { Card, Image, Text, Badge, Group } from "@mantine/core";

export default function InstallScriptInfoCard() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image src="cool-retro-term-01.jpg" height={120} alt="Retro Terminal" />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>1-Click-Solution</Text>
        <Badge>Beta</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        Copy this command into your Debian or Ubuntu terminal. This will install
        the services you selected. This script will install docker and docker
        compose. You might have to enter your password. You can always copy the
        files and commands manually. You need to do it manually, when you are
        not using a Debian based distro like Ubuntu.
      </Text>
    </Card>
  );
}
