import type { Metadata } from "next";
import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";

import { ColorSchemeScript } from "@mantine/core";
import Provider from "./providers";

export const metadata: Metadata = {
  title: "Monero Suite",
  description:
    "Build your personal docker-compose.yml file for Monero services.",
  robots: "index, follow",
  generator: "Next.js",
  keywords: "Monero, Monero Suite, docker, compose, generator, docker-compose",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://xmr.guide",
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
        <ColorSchemeScript />
      </head>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
