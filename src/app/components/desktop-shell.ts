export type DesktopShellKind = "playground" | "advanced-2" | "advanced-3";

export function desktopShellKind(args: {
  advancedOpened: boolean;
  lgUp: boolean;
}): DesktopShellKind {
  if (!args.advancedOpened) {
    return "playground";
  }
  return args.lgUp ? "advanced-3" : "advanced-2";
}
