import { BarChart3, Building2, Plane } from "lucide-react";

import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: BarChart3,
    title: "Sync creator metrics",
    body: "Followers, posts, likes, views, comments, reels, and engagement are normalized by the backend provider layer."
  },
  {
    icon: Building2,
    title: "Generate a signature building",
    body: "Height, floors, glow, footprint, district, and material style are mapped from your Instagram performance."
  },
  {
    icon: Plane,
    title: "Fly through the city",
    body: "Pilot a small 3D plane through seeded and connected creator buildings with a modal for each profile."
  }
];

export function FeatureGrid() {
  return (
    <section className="bg-[#0d141c] px-6 py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <Icon className="mb-5 h-7 w-7 text-signal" />
              <h2 className="text-xl font-bold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{feature.body}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
