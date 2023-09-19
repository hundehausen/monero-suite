"use client";

import { useServices } from "@/hooks/use-services";
import Preview from "./components/Preview";
import Selection from "./components/Selection";
import {
  AppShell,
  Container,
  Flex,
  Grid,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { services, stateFunctions } = useServices();

  return (
    <AppShell header={{ height: 48 }}>
      <AppShell.Header
        styles={{
          header: {
            padding: "0 32px",
          },
        }}
      >
        <Flex justify="space-between" align="center">
          <Title order={1}>Monero Suite</Title>
          <Flex align="center" justify="space-between" gap="md">
            <Link
              href="https://github.com/hundehausen/monero-suite"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <FaGithub size={32} />
            </Link>
            <DarkModeSwitch
              checked={colorScheme === "dark"}
              onChange={() =>
                setColorScheme(colorScheme === "dark" ? "light" : "dark")
              }
              size={32}
            />
          </Flex>
        </Flex>
      </AppShell.Header>
      <AppShell.Main>
        <Container
          styles={{
            root: {
              padding: "32px 0",
            },
          }}
        >
          <Grid
            gutter="lg"
            styles={{
              root: {
                overflow: "initial",
              },
            }}
          >
            <Grid.Col span={4}>
              <Selection services={services} stateFunctions={stateFunctions} />
            </Grid.Col>
            <Grid.Col span={8}>
              <Preview
                services={Object.values(services).filter(
                  (service) =>
                    service.checked !== false && service.checked !== "none"
                )}
              />
            </Grid.Col>
          </Grid>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
