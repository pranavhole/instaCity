import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("frontend Docker build config", () => {
  test("passes NEXT_PUBLIC_API_URL into the Next.js build layer", () => {
    const dockerfile = readFileSync(join(process.cwd(), "Dockerfile"), "utf8");
    const buildIndex = dockerfile.indexOf("RUN npm run build");

    expect(buildIndex).toBeGreaterThan(-1);
    expect(dockerfile.indexOf("ARG NEXT_PUBLIC_API_URL")).toBeGreaterThan(-1);
    expect(dockerfile.indexOf("ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}")).toBeGreaterThan(-1);
    expect(dockerfile.indexOf("ARG NEXT_PUBLIC_API_URL")).toBeLessThan(buildIndex);
    expect(dockerfile.indexOf("ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}")).toBeLessThan(buildIndex);
  });
});
