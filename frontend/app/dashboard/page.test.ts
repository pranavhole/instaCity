import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("Dashboard page", () => {
  test("offers an explicit home route and removes manual cache sync", () => {
    const source = readFileSync(join(process.cwd(), "app", "dashboard", "page.tsx"), "utf8");

    expect(source).toContain('href="/"');
    expect(source).toContain("Home");
    expect(source).not.toContain("syncInstagram");
    expect(source).not.toContain("Rebuild From Cache");
  });
});
