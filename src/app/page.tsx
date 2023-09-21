"use client";

import { useServices } from "@/hooks/use-services";
import Preview from "./components/Preview";
import Selection from "./components/Selection";
import {
  AppShell,
  Container,
  Flex,
  Grid,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { services, stateFunctions } = useServices();

  return (
    <AppShell
      header={{
        height: {
          base: 96,
          xs: 48,
        },
      }}
    >
      <AppShell.Header
        styles={{
          header: {
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          },
        }}
      >
        <Flex justify="space-between" align="center" w={"100%"}>
          <Title order={1}>Monero Suite</Title>
          <Flex
            align="center"
            justify="space-between"
            gap={{
              base: 12,
              xs: 16,
            }}
          >
            <Link
              href="https://x.com/hundehausen/"
              title="hundehausen's profile on x.com"
              target="_blank"
              style={{ color: "inherit", textDecoration: "none", height: 32 }}
            >
              <Image
                src="/hundehausen.png"
                alt="hundehausen's profile on x.com"
                style={{ borderRadius: "50%" }}
                width={32}
                height={32}
              />
            </Link>
            <Link
              href="https://sethforprivacy.com/guides/run-a-p2pool-node/"
              target="_blank"
              title="Monero related guides from sethforprivacy.com"
              style={{ color: "inherit", textDecoration: "none", height: 32 }}
            >
              <Image
                src="/seth.png"
                alt="Monero related guides from sethforprivacy.com"
                style={{ borderRadius: "50%" }}
                width={32}
                height={32}
              />
            </Link>
            <Link
              href="https://github.com/hundehausen/monero-suite"
              target="_blank"
              rel="noopener noreferrer"
              title="Source code on GitHub"
              style={{
                color: "inherit",
                textDecoration: "none",
                height: 32,
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
      <AppShell.Main mt={48}>
        <Container>
          <Grid
            gutter="lg"
            styles={{
              root: {
                overflow: "initial",
                padding: "0 8px",
              },
            }}
          >
            <Grid.Col
              span={{
                xs: 12,
                md: 4,
              }}
            >
              <Selection services={services} stateFunctions={stateFunctions} />
            </Grid.Col>
            <Grid.Col
              span={{
                xs: 12,
                md: 8,
              }}
            >
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
      <AppShell.Footer>
        <Container
          styles={{
            root: {
              padding: "8px 0",
            },
          }}
        >
          <Flex justify="center" align="center">
            <Text>
              87cQNxrM3oWVkZ8TRWUHi9LmvruKgQSA7AxqoqJDr7n1PgGcZkXhAToVz3rEWxjAMj7caKCcqjYfDSFeLey1Sf4hUF3gmNn
            </Text>
          </Flex>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}
