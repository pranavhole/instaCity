import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { brandPalette } from "@/lib/brand";
import { BrandLogo } from "./BrandLogo";

describe("BrandLogo", () => {
  test("renders the Oinsta City logo with the supplied sunset city palette", () => {
    const html = renderToStaticMarkup(<BrandLogo />);

    expect(html).toContain("Oinsta City");
    expect(html).toContain("Explore. Connect. Belong.");
    expect(html).toContain(brandPalette.sunrise);
    expect(html).toContain(brandPalette.neonPink);
    expect(html).toContain(brandPalette.violet);
  });
});
