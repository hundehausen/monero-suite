import type {
  PropertiesNetworks,
  PropertiesServices,
  PropertiesVolumes,
} from "compose-spec-schema/lib/type";

export interface Service {
  name: string;
  description: string;
  checked: boolean | string;
  required: boolean;
  bash?: string;
  env?: {
    [key: string]: string | number | boolean;
  };
  code: PropertiesServices;
  volumes?: PropertiesVolumes;
  architecture: Architecture[];
  ufw?: string[];
  networks?: PropertiesNetworks;
}

export interface ServiceMap {
  [key: string]: Service;
}

export const p2poolModes = {
  none: "none",
  mini: "mini",
  full: "full",
  nano: "nano",
} as const;

export type P2PoolMode = (typeof p2poolModes)[keyof typeof p2poolModes];

export const minigModes = {
  none: "none",
  xmrig: "xmrig",
  p2pool: "p2pool",
} as const;

export type MiningMode = (typeof minigModes)[keyof typeof minigModes];

export const torProxyModes = {
  none: "none",
  txonly: "tx-only",
  full: "full",
} as const;

export type TorProxyMode = (typeof torProxyModes)[keyof typeof torProxyModes];

export const architectures = {
  linuxAmd: "linux/amd64",
  linuxArm: "linux/arm64",
} as const;

export type Architecture = (typeof architectures)[keyof typeof architectures];

export const networkModes = {
  exposed: "exposed",
  local: "local",
} as const;

export type NetworkMode = (typeof networkModes)[keyof typeof networkModes];
