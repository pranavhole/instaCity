import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CityBuilding } from "@/lib/types";

export function BuildingPreview({ building }: { building: CityBuilding | null }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal">Your building</p>
          <h2 className="mt-2 text-3xl font-black text-white">{building?.building_type ?? "Ready to generate"}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            {building
              ? `${building.district} district, ${building.floors} floors, ${building.material_style} material, neon strength ${building.glow_intensity}.`
              : "Sync Instagram data to generate a deterministic building, then enter the city to fly around it."}
          </p>
        </div>
        <Link href="/city">
          <Button>Enter city</Button>
        </Link>
      </div>
      <div className="mt-6 flex h-48 items-end justify-center gap-3 rounded-lg bg-[#0b1117] p-6 city-grid">
        <div
          className="w-20 rounded-t-md"
          style={{
            height: building ? `${Math.max(42, Math.min(170, building.height * 2.2))}px` : "80px",
            background: building ? `linear-gradient(180deg, ${building.color_palette[0]}, ${building.color_palette[1]})` : "linear-gradient(180deg, #19c2a0, #6ea8fe)"
          }}
        />
        <div className="h-24 w-10 rounded-t-md bg-white/25" />
        <div className="h-16 w-14 rounded-t-md bg-coral/70" />
      </div>
    </Card>
  );
}
