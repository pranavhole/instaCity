import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

import { PublicInstagramSelector } from "./PublicInstagramSelector";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

describe("PublicInstagramSelector", () => {
  test("renders an Apify-backed public profile selector without OAuth copy", () => {
    const html = renderToStaticMarkup(<PublicInstagramSelector />);

    expect(html).toContain("Instagram profile URL or username");
    expect(html).toContain("Build city");
    expect(html).not.toContain("Login with Instagram");
    expect(html).not.toContain("OAuth");
  });

  test("includes a full-screen building loader for long profile imports", () => {
    const source = readFileSync(join(process.cwd(), "components", "instagram", "PublicInstagramSelector.tsx"), "utf8");

    expect(source).toContain("Building city");
    expect(source).toContain("fixed inset-0");
  });
});
