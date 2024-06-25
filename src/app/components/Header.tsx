import { Flex, Title, Text, useMantineColorScheme } from "@mantine/core";
import Link from "next/link";
import Image from "next/image";
import { FaDocker, FaGithub } from "react-icons/fa";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import Logo from "../../../public/monero-suite-logo-transparent.png";

const Header = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Flex justify="space-between" align="center" w={"100%"}>
      <Flex align="center" gap={16}>
        <Image src={Logo} alt="Monero Suite logo" width={40} height={40} />
        <Title order={1}>Monero Suite</Title>
      </Flex>
      <Text>Monero Suite is this</Text>
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
        <Link
          href="https://docs.docker.com/get-started/docker_cheatsheet.pdf"
          title="Cheatsheet with all important commands for the docker cli"
          target="_blank"
          style={{ color: "inherit", textDecoration: "none", height: 32 }}
        >
          <FaDocker size={32} />
        </Link>
        <DarkModeSwitch
          checked={colorScheme === "dark"}
          onChange={() =>
            setColorScheme(colorScheme === "dark" ? "light" : "dark")
          }
          size={32}
          title="Toggle dark mode"
        />
      </Flex>
    </Flex>
  );
};

export default Header;
