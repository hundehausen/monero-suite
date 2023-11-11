import type { Metadata } from "next";
import "@mantine/core/styles.css";

import { ColorSchemeScript } from "@mantine/core";
import Provider from "./providers";

export const metadata: Metadata = {
  title: "Monero Suite",
  description:
    "Build your personal docker-compose.yml file for Monero services.",
  robots: "index, follow",
  generator: "Next.js",
  keywords: "Monero, Monero Suite, docker, compose, generator, docker-compose",
  metadataBase: new URL("https://monerosuite.org"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://monerosuite.org",
    title: "Monero Suite",
    description:
      "Build your personal docker-compose.yml file for Monero services.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
