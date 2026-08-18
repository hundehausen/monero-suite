import { describe, expect, it } from "vitest";
import { createMonitoringService } from "./monitoring";
import { architectures, networkModes } from "@/lib/service-types";

describe("createMonitoringService", () => {
  it("is available on linux/amd64 and linux/arm64", () => {
    const service = createMonitoringService(
      true,
      "localhost:3000",
      networkModes.local,
      false
    );

    expect(service.architecture).toEqual([
      architectures.linuxAmd,
      architectures.linuxArm,
    ]);
  });
});
