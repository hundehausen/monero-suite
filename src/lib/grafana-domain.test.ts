import { describe, expect, it } from "vitest";
import { nextGrafanaDomain, isGrafanaLocalDomain } from "./grafana-domain";
import { GRAFANA_LOCAL_DOMAIN, GRAFANA_TRAEFIK_DEFAULT_DOMAIN } from "./constants";

describe("nextGrafanaDomain", () => {
  it("resets to local when Traefik is off", () => {
    expect(nextGrafanaDomain(false, true, GRAFANA_TRAEFIK_DEFAULT_DOMAIN)).toBe(
      GRAFANA_LOCAL_DOMAIN
    );
  });

  it("resets to local when Grafana-under-Traefik is off", () => {
    expect(nextGrafanaDomain(true, false, "grafana.mydomain.com")).toBe(
      GRAFANA_LOCAL_DOMAIN
    );
  });

  it("prefills monitor.example.com when enabling Traefik on a localhost domain", () => {
    expect(nextGrafanaDomain(true, true, "localhost:3000")).toBe(
      GRAFANA_TRAEFIK_DEFAULT_DOMAIN
    );
    expect(nextGrafanaDomain(true, true, "localhost")).toBe(
      GRAFANA_TRAEFIK_DEFAULT_DOMAIN
    );
  });

  it("does not overwrite a user-set real domain when Traefik is on", () => {
    expect(nextGrafanaDomain(true, true, "grafana.mydomain.com")).toBeNull();
  });

  it("returns null when already on the correct local default", () => {
    expect(nextGrafanaDomain(false, true, GRAFANA_LOCAL_DOMAIN)).toBeNull();
  });
});

describe("isGrafanaLocalDomain", () => {
  it("detects localhost forms", () => {
    expect(isGrafanaLocalDomain("localhost:3000")).toBe(true);
    expect(isGrafanaLocalDomain("127.0.0.1")).toBe(true);
    expect(isGrafanaLocalDomain("monitor.example.com")).toBe(false);
  });
});
