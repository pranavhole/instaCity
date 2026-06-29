"use client";

import type { CityBuilding } from "@/lib/types";
import { useCityStore } from "@/stores/cityStore";

const SIZE = 150;
const WORLD = 900;

function mapCoord(value: number) {
  return ((value + WORLD / 2) / WORLD) * SIZE;
}

export function Minimap({ buildings }: { buildings: CityBuilding[] }) {
  const plane = useCityStore((state) => state.plane);

  return (
    <div className="absolute bottom-4 left-4 z-20 hidden h-[150px] w-[150px] rounded-lg border border-white/10 bg-brand-panel/85 shadow-glow backdrop-blur md:block">
      <div className="absolute left-3 top-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Radar</div>
      {buildings.map((building) => (
        <span
          key={building.id}
          className="absolute h-1.5 w-1.5 rounded-full bg-signal"
          style={{
            left: mapCoord(building.position_x),
            top: mapCoord(building.position_z),
            boxShadow: `0 0 10px ${building.color_palette[0] ?? "#ff2f87"}`
          }}
        />
      ))}
      <span
        className="absolute h-3 w-3 rounded-full bg-coral"
        style={{
          left: mapCoord(plane.x) - 4,
          top: mapCoord(plane.z) - 4,
          transform: `rotate(${plane.heading}rad)`
        }}
      >
        <span className="absolute left-1/2 top-[-7px] h-2 w-0.5 -translate-x-1/2 rounded-full bg-coral" />
      </span>
    </div>
  );
}
