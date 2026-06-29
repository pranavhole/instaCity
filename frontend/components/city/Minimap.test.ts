import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Minimap responsive behavior", () => {
  it("is hidden on phone viewports so it does not cover the joystick", () => {
    const source = readFileSync(join(process.cwd(), "components", "city", "Minimap.tsx"), "utf8");

    expect(source).toContain("hidden");
    expect(source).toContain("md:block");
  });
});
