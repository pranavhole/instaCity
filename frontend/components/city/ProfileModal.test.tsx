import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { CityBuilding } from "@/lib/types";
import { ProfileModalContent } from "./ProfileModal";

const building: CityBuilding = {
  id: "building-1",
  instagram_account_id: "account-1",
  username: "humansofny",
  profile_picture_url: "https://cdn.example.com/profile.jpg",
  category: "Public profile",
  building_type: "Creator Studio",
  district: "Default",
  height: 24,
  width: 8,
  depth: 8,
  floors: 12,
  glow_intensity: 0.5,
  material_style: "glass",
  position_x: 0,
  position_y: 0,
  position_z: 0,
  color_palette: ["#ff2f87", "#7c2be8"],
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
  stats: {
    followers_count: 0,
    follows_count: 0,
    media_count: 2,
    avg_likes: 200,
    avg_comments: 25,
    avg_views: 6000,
    reels_count: 1,
    engagement_rate: 0,
    top_post_image_url: "https://cdn.example.com/viral.jpg",
    top_post_url: "https://www.instagram.com/p/viral/",
  },
};

describe("ProfileModal", () => {
  test("shows the most viral post image beside profile details", () => {
    const html = renderToStaticMarkup(<ProfileModalContent building={building} onClose={() => undefined} />);

    expect(html).toContain("@humansofny");
    expect(html).toContain("Most viral post");
    expect(html).toContain("https://cdn.example.com/viral.jpg");
    expect(html).toContain("https://www.instagram.com/p/viral/");
  });
});
