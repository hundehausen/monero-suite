import { useMediaQuery } from "@mantine/hooks";

/** Same query as Mantine `md`. */
export const MD_UP = "(min-width: 62em)";

/** Same query as Mantine `lg`. */
export const LG_UP = "(min-width: 75em)";

export function useMdUp(): boolean {
  return useMediaQuery(MD_UP, false, { getInitialValueInEffect: false });
}

export function useLgUp(): boolean {
  return useMediaQuery(LG_UP, false, { getInitialValueInEffect: false });
}
