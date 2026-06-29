"use client";

import { useQuery } from "@tanstack/react-query";
import { Home } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { BuildingPreview } from "@/components/dashboard/BuildingPreview";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PublicInstagramSelector } from "@/components/instagram/PublicInstagramSelector";
import { LoadingState } from "@/components/ui/LoadingState";
import { getMe, getMyBuilding, getMyStats } from "@/lib/api";

export default function DashboardPage() {
  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe, retry: false });
  const statsQuery = useQuery({ queryKey: ["stats"], queryFn: getMyStats, retry: false, enabled: Boolean(meQuery.data?.instagram_account) });
  const buildingQuery = useQuery({ queryKey: ["my-building"], queryFn: getMyBuilding, retry: false, enabled: Boolean(meQuery.data?.instagram_account) });

  if (meQuery.isLoading) {
    return (
      <main className="min-h-screen bg-asphalt px-6 py-10">
        <LoadingState label="Loading dashboard" />
      </main>
    );
  }

  if (meQuery.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-asphalt px-6">
        <div className="w-full max-w-lg rounded-lg border border-white/10 bg-brand-panel/80 p-6 shadow-glow">
          <BrandLogo compact className="mb-6 justify-center" />
          <h1 className="text-center text-2xl font-bold text-white">Select a public profile</h1>
          <p className="mt-3 text-center text-sm leading-6 text-slate-300">Build a city from a public profile URL or username.</p>
          <PublicInstagramSelector className="mt-6" />
          <Link href="/" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </main>
    );
  }

  const stats = statsQuery.data ?? null;
  const building = buildingQuery.data ?? null;

  return (
    <main className="min-h-screen bg-asphalt px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" aria-label="Oinsta City home">
              <BrandLogo compact />
            </Link>
            <h1 className="mt-2 text-4xl font-black text-white">Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link href="/city" className="inline-flex items-center rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Enter City
            </Link>
          </div>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <AccountCard user={meQuery.data?.user ?? null} account={meQuery.data?.instagram_account ?? null} />
          <StatsGrid stats={stats} />
        </div>

        <div className="mt-5">
          <BuildingPreview building={building} />
        </div>
      </div>
    </main>
  );
}
