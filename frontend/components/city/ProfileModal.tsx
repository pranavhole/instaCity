"use client";

import { ExternalLink, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { STAT_FORMATTER } from "@/lib/constants";
import { useCityStore } from "@/stores/cityStore";

export function ProfileModal() {
  const building = useCityStore((state) => state.selectedBuilding);
  const setSelectedBuilding = useCityStore((state) => state.setSelectedBuilding);

  if (!building) return null;

  const stats = building.stats;
  const statItems = [
    ["Followers", stats?.followers_count],
    ["Posts", stats?.media_count],
    ["Avg likes", stats?.avg_likes],
    ["Avg views", stats?.avg_views],
    ["Engagement", stats ? `${stats.engagement_rate.toFixed(2)}%` : null]
  ];

  return (
    <div className="absolute right-4 top-4 z-20 w-[min(390px,calc(100vw-2rem))] rounded-lg border border-white/10 bg-[#101820]/95 p-5 shadow-glow backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-white/10">
            {building.profile_picture_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={building.profile_picture_url} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">@{building.username}</h2>
            <p className="text-sm text-slate-400">{building.category ?? building.district}</p>
          </div>
        </div>
        <button onClick={() => setSelectedBuilding(null)} className="rounded-md p-2 text-slate-300 hover:bg-white/10" aria-label="Close profile">
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

      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Recent media preview</div>
        <div className="grid grid-cols-3 gap-2">
          {building.color_palette.map((color, index) => (
            <div key={`${color}-${index}`} className="h-16 rounded-md" style={{ background: `linear-gradient(135deg, ${color}, #111827)` }} />
          ))}
        </div>
      </div>

      <a href={`https://www.instagram.com/${building.username}`} target="_blank" rel="noreferrer">
        <Button className="mt-5 w-full">
          Visit Instagram
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>
    </div>
  );
}
