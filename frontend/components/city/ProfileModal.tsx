"use client";

import { ExternalLink, ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { STAT_FORMATTER } from "@/lib/constants";
import { profileInitials } from "@/lib/profile-fallback";
import type { CityBuilding } from "@/lib/types";
import { useCityStore } from "@/stores/cityStore";

export function ProfileModalContent({ building, onClose }: { building: CityBuilding; onClose: () => void }) {
  const stats = building.stats;
  const topPostImage = stats?.top_post_image_url;
  const topPostUrl = stats?.top_post_url;
  const initials = profileInitials(building.username);
  const statItems = [
    ["Followers", stats?.followers_count],
    ["Posts", stats?.media_count],
    ["Avg likes", stats?.avg_likes],
    ["Avg views", stats?.avg_views],
    ["Engagement", stats ? `${stats.engagement_rate.toFixed(2)}%` : null]
  ];

  return (
    <div className="absolute right-4 top-4 z-20 w-[min(390px,calc(100vw-2rem))] rounded-lg border border-white/10 bg-brand-panel/95 p-5 shadow-glow backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <RemoteImage
              src={building.profile_picture_url}
              className="h-12 w-12 overflow-hidden rounded-lg bg-brand-gradient p-[2px]"
              imageClassName="h-full w-full rounded-[0.4rem] object-cover"
              fallback={<div className="flex h-full w-full items-center justify-center rounded-[0.4rem] bg-brand-panel text-sm font-black text-white">{initials}</div>}
            />
            {topPostImage ? (
              <a href={topPostUrl ?? `https://www.instagram.com/${building.username}`} target="_blank" rel="noreferrer" className="group relative h-12 w-12 overflow-hidden rounded-lg border border-signal/40 bg-white/10">
                <RemoteImage
                  src={topPostImage}
                  imageClassName="h-full w-full object-cover transition group-hover:scale-105"
                  fallback={<div className="flex h-full w-full items-center justify-center bg-brand-panel text-signal"><ImageIcon className="h-5 w-5" /></div>}
                />
                <span className="sr-only">Most viral post</span>
              </a>
            ) : null}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-white">@{building.username}</h2>
            <p className="text-sm text-slate-400">{building.category ?? building.district}</p>
            {topPostImage ? <p className="mt-1 text-xs font-semibold text-signal">Most viral post</p> : null}
          </div>
        </div>
        <button onClick={onClose} className="rounded-md p-2 text-slate-300 hover:bg-white/10" aria-label="Close profile">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {statItems.map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/[0.05] p-3">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="mt-1 text-lg font-bold text-white">{typeof value === "number" ? STAT_FORMATTER.format(value) : value ?? "n/a"}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-white/10 bg-white/[0.05] p-3">
        <div className="text-sm font-semibold text-white">{building.building_type}</div>
        <div className="mt-1 text-xs text-slate-400">{building.district} district - {building.floors} floors - {building.material_style}</div>
      </div>

      {topPostImage ? (
        <a href={topPostUrl ?? `https://www.instagram.com/${building.username}`} target="_blank" rel="noreferrer" className="mt-5 block overflow-hidden rounded-md border border-white/10 bg-white/[0.05]">
          <div className="px-3 pt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Most viral post</div>
          <RemoteImage
            src={topPostImage}
            className="mt-3 h-36 w-full"
            imageClassName="h-full w-full object-cover"
            fallback={<div className="flex h-full w-full items-center justify-center bg-brand-panel text-signal"><ImageIcon className="h-8 w-8" /></div>}
          />
        </a>
      ) : (
        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Profile palette</div>
          <div className="grid grid-cols-3 gap-2">
            {building.color_palette.map((color, index) => (
              <div key={`${color}-${index}`} className="h-16 rounded-md" style={{ background: `linear-gradient(135deg, ${color}, #050712)` }} />
            ))}
          </div>
        </div>
      )}

      <a href={`https://www.instagram.com/${building.username}`} target="_blank" rel="noreferrer">
        <Button className="mt-5 w-full">
          Visit Instagram
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>
    </div>
  );
}

export function ProfileModal() {
  const building = useCityStore((state) => state.selectedBuilding);
  const setSelectedBuilding = useCityStore((state) => state.setSelectedBuilding);

  if (!building) return null;

  return <ProfileModalContent building={building} onClose={() => setSelectedBuilding(null)} />;
}
