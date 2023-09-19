"use client";

import { MantineProvider, createTheme } from "@mantine/core";

const customTheme = createTheme({
  primaryColor: "monero-orange",
  colors: {
    "monero-orange": [
      "#fff1e2",
      "#ffe2cc",
      "#ffc39b",
      "#ffa264",
      "#fe8637",
      "#fe741a",
      "#ff6c09",
      "#e45a00",
      "#cb4f00",
      "#b14100",
    ],
  },
});

const Provider = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider defaultColorScheme="dark" theme={customTheme}>
    {children}
  </MantineProvider>
);

export default Provider;
