import { describe, expect, it } from "vitest";
import { getTraefikLabels, isPlaceholderDomain, getP2pPortBinding } from "./docker-helpers";
import { networkModes } from "./service-types";

describe("isPlaceholderDomain", () => {
  it.each([
    "",
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:9443",
    "example.com",
    "portainer.example.com",
    "monitor.example.com",
    "node.example.com",
    "  Grafana.Example.COM  ",
  ])("treats %j as placeholder", (domain) => {
    expect(isPlaceholderDomain(domain)).toBe(true);
  });

  it.each([
    "grafana.mydomain.com",
    "node.example.org",
    "monitor.real-domain.net",
  ])("treats %j as real", (domain) => {
    expect(isPlaceholderDomain(domain)).toBe(false);
  });
});

describe("getP2pPortBinding", () => {
  it("omits the host mapping for a private VPS node", () => {
    expect(getP2pPortBinding(false, networkModes.exposed, 18080)).toEqual([]);
    expect(getP2pPortBinding(false, networkModes.exposed, "18085")).toEqual([]);
  });

  it("publishes on all interfaces for a public node, including on a VPS", () => {
    expect(getP2pPortBinding(true, networkModes.exposed, 18080)).toEqual(["18080:18080"]);
    expect(getP2pPortBinding(true, networkModes.local, "18085")).toEqual(["18085:18085"]);
  });

  it("publishes on all interfaces for a private node on a local/NAT host", () => {
    expect(getP2pPortBinding(false, networkModes.local, 18080)).toEqual(["18080:18080"]);
    expect(getP2pPortBinding(false, networkModes.local, 38080)).toEqual(["38080:38080"]);
  });
});

describe("getTraefikLabels", () => {
  it("returns undefined when Traefik is off", () => {
    expect(
      getTraefikLabels(false, "portainer", "portainer.mydomain.com", "9000", "monerosuite")
    ).toBeUndefined();
  });

  it("returns undefined for placeholder domains even when Traefik is on", () => {
    expect(
      getTraefikLabels(true, "portainer", "portainer.example.com", "9000", "monerosuite")
    ).toBeUndefined();
    expect(
      getTraefikLabels(true, "monitoring", "localhost:3000", "3000", "monerosuite")
    ).toBeUndefined();
  });

  it("returns Host rule labels for a real domain", () => {
    const labels = getTraefikLabels(
      true,
      "portainer",
      "portainer.mydomain.com",
      "9000",
      "monerosuite"
    );
    expect(labels).toEqual({
      "traefik.enable": "true",
      "traefik.http.routers.portainer.rule": "Host(`portainer.mydomain.com`)",
      "traefik.http.routers.portainer.entrypoints": "websecure",
      "traefik.http.routers.portainer.tls.certresolver": "monerosuite",
      "traefik.http.services.portainer.loadbalancer.server.port": "9000",
    });
  });
});
