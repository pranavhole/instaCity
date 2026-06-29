import { BarChart3, Eye, Heart, MessageCircle, Users } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { STAT_FORMATTER } from "@/lib/constants";
import type { InstagramStats } from "@/lib/types";

export function StatsGrid({ stats }: { stats: InstagramStats | null }) {
  const items = [
    { label: "Followers", value: stats?.followers_count, icon: Users },
    { label: "Posts", value: stats?.media_count, icon: BarChart3 },
    { label: "Avg likes", value: stats?.avg_likes, icon: Heart },
    { label: "Avg views", value: stats?.avg_views, icon: Eye },
    { label: "Comments", value: stats?.avg_comments, icon: MessageCircle },
    { label: "Engagement", value: stats ? `${stats.engagement_rate.toFixed(2)}%` : null, icon: BarChart3 }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        const display = typeof item.value === "number" ? STAT_FORMATTER.format(item.value) : item.value ?? "n/a";
        return (
          <Card key={item.label} className="min-h-[132px]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">{item.label}</span>
              <span className="rounded-md bg-brand-gradient p-2">
                <Icon className="h-4 w-4 text-white" />
              </span>
            </div>
            <div className="text-3xl font-black text-white">{display}</div>
          </Card>
        );
      })}
    </div>
  );
}
