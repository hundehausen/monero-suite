"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { uploadInstallScript } from "@/app/actions";
import type { FullConfig } from "@/lib/config-schema";

interface UseInstallScriptParams {
  config: FullConfig;
}

export function useInstallScript({ config }: UseInstallScriptParams) {
  const [scriptUrl, setScriptUrl] = useState<string>();
  const [installationCommand, setInstallationCommand] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [currentConfigIsUploaded, setCurrentConfigIsUploaded] = useState(false);

  const lastUploadedConfig = useRef<string | null>(null);

  const configHash = useMemo(
    () => JSON.stringify(config),
    [config]
  );

  const handleScriptGeneration = async () => {
    setIsUploading(true);
    try {
      const scriptUrl = await uploadInstallScript(config);

      lastUploadedConfig.current = configHash;
      setCurrentConfigIsUploaded(true);
      setScriptUrl(scriptUrl);
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
    if (lastUploadedConfig.current !== configHash) {
      setCurrentConfigIsUploaded(false);
    }
  }, [configHash, currentConfigIsUploaded]);

  return { installationCommand, isUploading, currentConfigIsUploaded, handleScriptGeneration };
}
