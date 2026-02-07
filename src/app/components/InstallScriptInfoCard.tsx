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
        Copy this command into your Linux terminal. This will install the
        services you selected. This script will install Docker and Docker
        Compose. You might have to enter your password. Supported distros:
        Ubuntu, Debian, Fedora, CentOS Stream, Rocky Linux, AlmaLinux, and
        RHEL. You can always copy the files and commands manually. Add{" "}
        <strong>bash -s -- -v</strong> instead of <strong>bash</strong> for
        verbose output.
      </Text>
    </Card>
  );
}
