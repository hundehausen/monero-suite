"use client";

import { ActionIcon, Box, Burger, Flex, Menu, Title, Text } from "@mantine/core";
import Link from "next/link";
import Image from "next/image";
import { FaDocker, FaGithub } from "react-icons/fa";
import { TbDotsVertical } from "react-icons/tb";
import Logo from "../../../public/monero-suite-logo.png";
import Hundehausen from "../../../public/hundehausen.png";
import Seth from "../../../public/seth.png";
import DarkModeToggle from "./DarkModeToggle";
import { useSectionFocus } from "./section-focus";

const Header = () => {
  const { formOpened, toggleForm } = useSectionFocus();

  return (
    <Flex justify="space-between" align="center" w="100%" gap="sm" h="100%">
      <Flex align="center" gap={{ base: 8, md: 16 }} miw={0}>
        <Burger
          opened={formOpened}
          onClick={toggleForm}
          hiddenFrom="md"
          size="sm"
          aria-label="Configure services"
          aria-expanded={formOpened}
        />
        <Image
          src={Logo}
          alt="Monero Suite logo"
          width={40}
          height={40}
          fetchPriority="high"
          loading="eager"
          placeholder="blur"
        />
        <Title order={1} fz={{ base: 18, md: 28 }} lh={1} lineClamp={1}>
          Monero Suite
        </Title>
      </Flex>
      <Text lineClamp={1} display={{ base: "none", md: "initial" }}>
        Configure and deploy Monero services on your machine using Docker.
      </Text>
      <Flex align="center" gap={{ base: 8, md: 16 }} wrap="nowrap">
        <Flex align="center" gap={16} visibleFrom="md">
          <Link
            href="https://x.com/hundehausen/"
            title="hundehausen's profile on x.com"
            target="_blank"
            style={{ color: "inherit", textDecoration: "none", height: 32 }}
          >
            <Image
              src={Hundehausen}
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
              src={Seth}
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
          <Link
            href="https://docs.docker.com/get-started/docker_cheatsheet.pdf"
            title="Cheatsheet with all important commands for the docker cli"
            target="_blank"
            style={{ color: "inherit", textDecoration: "none", height: 32 }}
          >
            <FaDocker size={32} />
          </Link>
        </Flex>
        <Box hiddenFrom="md">
          <Menu shadow="md" width={220} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                aria-label="Links"
              >
                <TbDotsVertical size={20} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                component="a"
                href="https://x.com/hundehausen/"
                target="_blank"
              >
                hundehausen
              </Menu.Item>
              <Menu.Item
                component="a"
                href="https://sethforprivacy.com/guides/run-a-p2pool-node/"
                target="_blank"
              >
                Seth&apos;s P2Pool guide
              </Menu.Item>
              <Menu.Item
                component="a"
                href="https://github.com/hundehausen/monero-suite"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Menu.Item>
              <Menu.Item
                component="a"
                href="https://docs.docker.com/get-started/docker_cheatsheet.pdf"
                target="_blank"
              >
                Docker cheat sheet
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
        <DarkModeToggle />
      </Flex>
    </Flex>
  );
};

export default Header;
