import { describe, expect, it } from "vitest";
import { createMonitoringService } from "./monitoring";
import { architectures } from "@/lib/service-types";
import { makeFullConfig } from "@/lib/make-full-config";

describe("createMonitoringService", () => {
  it("is available on linux/amd64 and linux/arm64", () => {
    const config = makeFullConfig({
      services: { isMonitoring: true, grafanaDomain: "localhost:3000" },
    });
    const service = createMonitoringService(config);

    expect(service.architecture).toEqual([
      architectures.linuxAmd,
      architectures.linuxArm,
    ]);
  });

  it("bind-mounts monitoring configs without an SELinux suffix", () => {
    const service = createMonitoringService(
      makeFullConfig({ services: { isMonitoring: true } })
    );
    const prometheus = service.code.prometheus as { volumes: string[] };
    const grafana = service.code.grafana as { volumes: string[] };

    expect(prometheus.volumes).toContain(
      "./monitoring/prometheus/config.yaml:/etc/prometheus/config.yaml:ro"
    );
    expect(grafana.volumes).toEqual(
      expect.arrayContaining([
        "./monitoring/grafana/grafana.ini:/etc/grafana/grafana.ini:ro",
        "./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro",
        "./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro",
      ])
    );
  });

  it("writes the configured Grafana credentials into service.env", () => {
    const service = createMonitoringService(
      makeFullConfig({
        services: {
          isMonitoring: true,
          grafanaAdminUser: "ops",
          grafanaAdminPassword: "s3cret!",
        },
      })
    );
    expect(service.env?.GF_SECURITY_ADMIN_USER).toBe("ops");
    expect(service.env?.GF_SECURITY_ADMIN_PASSWORD).toBe("s3cret!");
  });
});
