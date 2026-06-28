import { BarChart3, Building2, Plane } from "lucide-react";

import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: BarChart3,
    title: "Cache public post data",
    body: "The backend checks PostgreSQL first, then runs the Apify scraper only when a profile has not been imported yet."
  },
  {
    icon: Building2,
    title: "Generate a signature building",
    body: "Height, floors, glow, footprint, district, and material style are mapped from public post performance."
  },
  {
    icon: Plane,
    title: "Fly through the city",
    body: "Pilot a school-style paper plane through imported creator buildings with a modal for each profile."
  }
];

export function FeatureGrid() {
  return (
    <section className="bg-[#080915] px-6 py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <div className="mb-5 inline-flex rounded-md bg-brand-gradient p-2">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{feature.body}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
