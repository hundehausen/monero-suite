import { useState, useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { uploadInstallScript } from "@/app/actions";

interface UseInstallScriptParams {
  dockerComposeYaml: string;
  enabledBashServices: { monitoring: boolean };
  envString: string | null;
  isExposed: boolean;
  firewallPorts: string;
  networkMode: string | null;
}

export function useInstallScript({
  dockerComposeYaml,
  enabledBashServices,
  envString,
  isExposed,
  firewallPorts,
  networkMode,
}: UseInstallScriptParams) {
  const [scriptUrl, setScriptUrl] = useState<string>();
  const [installationCommand, setInstallationCommand] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [currentConfigIsUploaded, setCurrentConfigIsUploaded] = useState(false);

  const lastUploadedConfig = useRef<{
    config: string | null;
    networkMode: string | null;
  }>({ config: null, networkMode: null });

  const handleScriptGeneration = async () => {
    setIsUploading(true);
    try {
      const configId = await uploadInstallScript({
        dockerComposeYaml,
        enabledBashServices,
        envContent: envString || undefined,
        isExposed,
        firewallPorts,
      });

      lastUploadedConfig.current = {
        config: dockerComposeYaml + JSON.stringify(enabledBashServices) + envString,
        networkMode,
      };

      setCurrentConfigIsUploaded(true);
      setScriptUrl(`${window.location.origin}/install/${configId}`);
      notifications.show({
        title: "Install command ready",
        message: "Copy the command below and paste it into your terminal.",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to upload script:", error);
      notifications.show({
        title: "Upload failed",
        message: "Could not generate install command. Check your connection and try again.",
        color: "red",
        autoClose: false,
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!scriptUrl) return;
    setInstallationCommand(`curl -sSL ${scriptUrl} | bash`);
  }, [scriptUrl]);

  useEffect(() => {
    if (!currentConfigIsUploaded) return;
    const currentConfig = dockerComposeYaml + JSON.stringify(enabledBashServices) + envString;
    if (
      lastUploadedConfig.current.config !== currentConfig ||
      lastUploadedConfig.current.networkMode !== networkMode
    ) {
      setCurrentConfigIsUploaded(false);
    }
  }, [dockerComposeYaml, enabledBashServices, envString, networkMode, currentConfigIsUploaded]);

  return { installationCommand, isUploading, currentConfigIsUploaded, handleScriptGeneration };
}
