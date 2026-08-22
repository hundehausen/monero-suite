import { describe, expect, it } from "vitest";
import { createPortainerService } from "./portainer";
import { makeFullConfig } from "@/lib/make-full-config";

describe("createPortainerService", () => {
  it("points the Traefik load balancer at the Portainer HTTP UI port (9000), not the Edge agent tunnel (8000)", () => {
    const config = makeFullConfig({
      services: {
        isPortainer: true,
        portainerDomain: "portainer.mydomain.com",
        isTraefik: true,
        isTraefikPortainer: true,
      },
    });
    const service = createPortainerService(config);
    const labels = service.code["portainer"].labels as Record<string, string>;
    expect(labels["traefik.http.services.portainer.loadbalancer.server.port"]).toBe("9000");
  });
});
