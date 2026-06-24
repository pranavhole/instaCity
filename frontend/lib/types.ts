export type User = {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
};

export type InstagramAccount = {
  id: string;
  username: string;
  profile_picture_url: string | null;
  account_type: string;
  category: string | null;
  last_synced_at: string | null;
};

export type InstagramStats = {
  followers_count: number;
  follows_count: number;
  media_count: number;
  avg_likes: number;
  avg_comments: number;
  avg_views: number;
  reels_count: number;
  engagement_rate: number;
};

export type MeResponse = {
  user: User;
  instagram_account: InstagramAccount | null;
};

export type CityBuilding = {
  id: string;
  instagram_account_id: string;
  username: string;
  profile_picture_url: string | null;
  category: string | null;
  building_type: string;
  district: string;
  height: number;
  width: number;
  depth: number;
  floors: number;
  glow_intensity: number;
  material_style: string;
  position_x: number;
  position_y: number;
  position_z: number;
  color_palette: string[];
  created_at: string;
  updated_at: string;
  stats: InstagramStats | null;
};

export type SyncResponse = {
  stats: InstagramStats;
  building: CityBuilding;
};
