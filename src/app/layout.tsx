import type { Metadata } from "next";
import "@mantine/core/styles.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <NuqsAdapter>
          <Provider>{children}</Provider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
