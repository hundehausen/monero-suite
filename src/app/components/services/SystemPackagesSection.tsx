"use client";

import { Checkbox, Text } from "@mantine/core";
import { useUpgradeSystemPackagesState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const SystemPackagesSection = () => {
  const { upgradeSystemPackages, setUpgradeSystemPackages } =
    useUpgradeSystemPackagesState();

  return (
    <AccordionItemComponent
      value="system-packages"
      title="System packages"
      checked={upgradeSystemPackages}
    >
      <Text size="sm">
        Package indexes are always refreshed so Docker can be installed. A full
        apt/dnf upgrade is optional. It can take a long time or restart
        services.
      </Text>
      <Checkbox
        checked={upgradeSystemPackages}
        label="Upgrade existing packages during install"
        labelPosition="left"
        size="lg"
        onChange={(event) =>
          setUpgradeSystemPackages(event.currentTarget.checked)
        }
      />
    </AccordionItemComponent>
  );
};

export default SystemPackagesSection;
