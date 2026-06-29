import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { InstagramAccount } from "@/lib/types";
import { AccountCard } from "./AccountCard";

const account: InstagramAccount = {
  id: "account-1",
  username: "humansofny",
  profile_picture_url: null,
  account_type: "APIFY_PUBLIC",
  category: "Public profile",
  last_synced_at: null
};

describe("AccountCard", () => {
  test("shows a readable profile fallback when no profile image is available", () => {
    const html = renderToStaticMarkup(<AccountCard user={null} account={account} />);

    expect(html).toContain("@humansofny");
    expect(html).toContain("HN");
  });
});
