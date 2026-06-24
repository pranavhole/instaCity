"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { CityScene } from "@/components/city/CityScene";
import { Minimap } from "@/components/city/Minimap";
import { ProfileModal } from "@/components/city/ProfileModal";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getBuildings } from "@/lib/api";

export default function CityPage() {
  const buildingsQuery = useQuery({ queryKey: ["buildings"], queryFn: getBuildings });
  const buildings = buildingsQuery.data ?? [];

  return (
    <main className="relative h-screen overflow-hidden bg-[#080d13]">
      {buildingsQuery.isLoading ? (
        <div className="flex h-full items-center justify-center">
          <LoadingState label="Loading city" />
        </div>
      ) : buildingsQuery.isError ? (
        <div className="mx-auto flex h-full max-w-lg items-center px-6">
          <ErrorState message={buildingsQuery.error.message} />
        </div>
      ) : buildings.length === 0 ? (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-3xl font-black text-white">No buildings yet</h1>
            <p className="mt-3 text-slate-300">Run the seed script or sync your Instagram data to populate the city.</p>
          </div>
        </div>
      ) : (
        <>
          <CityScene buildings={buildings} />
          <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-lg border border-white/10 bg-[#101820]/85 p-4 text-sm text-slate-200 shadow-glow backdrop-blur">
            <Link href="/dashboard" className="pointer-events-auto font-semibold text-signal">Dashboard</Link>
            <div className="mt-2 text-xs text-slate-400">Click city to lock mouse. WASD fly, Space climb, Shift descend.</div>
          </div>
          <Minimap buildings={buildings} />
          <ProfileModal />
        </>
      )}
    </main>
  );
}
