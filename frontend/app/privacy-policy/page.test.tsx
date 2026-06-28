import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import PrivacyPolicyPage, { metadata } from "./page";

describe("privacy policy page", () => {
  test("renders a public profile data privacy policy", () => {
    const html = renderToStaticMarkup(<PrivacyPolicyPage />);

    expect(metadata.title).toBe("Privacy Policy | Oinsta City");
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Information We Collect");
    expect(html).toContain("Public Profile Data");
    expect(html).toContain("Apify");
    expect(html).toContain("How We Use Information");
    expect(html).toContain("Contact");
  });
});
