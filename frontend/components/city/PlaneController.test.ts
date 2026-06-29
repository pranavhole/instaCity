import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("PlaneController mouse behavior", () => {
  it("does not use pointer lock so the mouse stays visible while flying", () => {
    const source = readFileSync(join(process.cwd(), "components", "city", "PlaneController.tsx"), "utf8");

    expect(source).not.toContain("requestPointerLock");
    expect(source).not.toContain("pointerLockElement");
  });

  it("combines keyboard and mobile control state", () => {
    const source = readFileSync(join(process.cwd(), "components", "city", "PlaneController.tsx"), "utf8");

    expect(source).toContain("mergeFlightKeys");
    expect(source).toContain("mobileKeys");
  });
});
