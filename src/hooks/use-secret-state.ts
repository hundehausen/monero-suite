"use client";

import { useEffect } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { parseAsString, useQueryState } from "nuqs";

export const SECRET_STORAGE_PREFIX = "monero-suite.";

export const SECRET_QUERY_KEYS = ["rpcLogin", "bootstrapDaemonLogin"] as const;

export function secretStorageKey(name: string): string {
  return `${SECRET_STORAGE_PREFIX}${name}`;
}

export function useSecretState(name: string, defaultValue: string) {
  return useLocalStorage({
    key: secretStorageKey(name),
    defaultValue,
  });
}

function useStripQueryKey(key: string) {
  const [value, setValue] = useQueryState(key, parseAsString);
  useEffect(() => {
    if (value !== null) {
      void setValue(null);
    }
  }, [value, setValue]);
}

export function useStripSecretQueryParams() {
  useStripQueryKey("rpcLogin");
  useStripQueryKey("bootstrapDaemonLogin");
}
