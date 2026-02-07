"use client";

import { AppShell } from "@mantine/core";
import Header from "./components/Header";
import Main from "./components/Main";
import { Suspense } from "react";
import { ServicesProvider } from "@/hooks/services-context";

export default function Home() {
  return (
    <AppShell
      padding={"lg"}
      header={{
        height: {
          base: 96,
          xs: 48,
        },
      }}
    >
      <AppShell.Header
        styles={{
          header: {
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          },
        }}
      >
        <Header />
      </AppShell.Header>
      <AppShell.Main>
        <Suspense fallback={<div>Loading Monero Suite...</div>}>
          <ServicesProvider>
            <Main />
          </ServicesProvider>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
