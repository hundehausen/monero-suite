import { describe, expect, it } from "vitest";
import { createPortainerService } from "./portainer";
import { networkModes } from "@/hooks/services/types";

describe("createPortainerService", () => {
  it("points the Traefik load balancer at the Portainer HTTP UI port (9000), not the Edge agent tunnel (8000)", () => {
    const service = createPortainerService(
      true,
      "portainer.example.com",
      networkModes.local,
      true,
      "monerosuite"
    );
    const labels = service.code["portainer"].labels as Record<string, string>;
    expect(labels["traefik.http.services.portainer.loadbalancer.server.port"]).toBe("9000");
  });
});
