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
});
