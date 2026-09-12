"use client";

import { AppShell } from "@mantine/core";
import Header from "./components/Header";
import Main from "./components/Main";
import { Suspense } from "react";
import { ServicesProvider } from "@/hooks/services-context";
import { SectionFocusProvider } from "./components/section-focus";

export default function Home() {
  return (
    <SectionFocusProvider>
      <AppShell
        padding={{ base: "sm", md: "lg" }}
        header={{ height: 56 }}
      >
        <AppShell.Header
          px={{ base: "sm", md: "lg" }}
          styles={{
            header: {
              display: "flex",
              alignItems: "center",
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
    </SectionFocusProvider>
  );
}
