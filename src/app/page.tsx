"use client";

import { useServices } from "@/hooks/use-services";
import ComposePreview from "./components/ComposePreview";
import Selection from "./components/Selection";
import { AppShell, Container, Grid, Text } from "@mantine/core";
import BashPreview from "./components/BashPreview";
import Header from "./components/Header";

export default function Home() {
  const { services, stateFunctions } = useServices();

  const checkedServices = Object.values(services).filter(
    (service) => service.checked !== false && service.checked !== "none"
  );

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
        <Grid
          gutter="lg"
          align="stretch"
          styles={{
            root: {
              padding: "0 8px",
            },
          }}
        >
          <Grid.Col span={"auto"}>
            <Selection services={services} stateFunctions={stateFunctions} />
          </Grid.Col>
          <Grid.Col
            span={{
              xs: 12,
              md: 5,
            }}
          >
            <ComposePreview services={checkedServices} />
          </Grid.Col>
          <Grid.Col
            span={{
              xs: 12,
              md: 4,
            }}
          >
            <BashPreview services={checkedServices} />
          </Grid.Col>
        </Grid>
      </AppShell.Main>
      <AppShell.Footer>
        <Container
          styles={{
            root: {
              padding: "8px",
            },
          }}
        >
          <Text
            ta="center"
            size="sm"
            styles={{
              root: {
                wordBreak: "keep-all",
                overflowWrap: "break-word",
              },
            }}
          >
            87cQNxrM3oWVkZ8TRWUHi9LmvruKgQSA7AxqoqJDr7n1PgGcZkXhAToVz3rEWxjAMj7caKCcqjYfDSFeLey1Sf4hUF3gmNn
          </Text>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}
