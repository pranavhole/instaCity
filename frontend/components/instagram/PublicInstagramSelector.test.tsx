import { renderToStaticMarkup } from "react-dom/server";
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
});
