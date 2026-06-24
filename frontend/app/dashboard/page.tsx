"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

import { AccountCard } from "@/components/dashboard/AccountCard";
import { BuildingPreview } from "@/components/dashboard/BuildingPreview";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getMe, getMyBuilding, getMyStats, syncInstagram } from "@/lib/api";
import { startInstagramLogin } from "@/lib/auth";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe, retry: false });
  const statsQuery = useQuery({ queryKey: ["stats"], queryFn: getMyStats, retry: false, enabled: Boolean(meQuery.data?.instagram_account) });
  const buildingQuery = useQuery({ queryKey: ["my-building"], queryFn: getMyBuilding, retry: false, enabled: Boolean(meQuery.data?.instagram_account) });
  const syncMutation = useMutation({
    mutationFn: syncInstagram,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
      void queryClient.invalidateQueries({ queryKey: ["my-building"] });
      void queryClient.invalidateQueries({ queryKey: ["buildings"] });
    }
  });

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
        <div className="max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Connect Instagram</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Use the mock Instagram flow to create a local session and generate your city building.</p>
          <Button onClick={() => void startInstagramLogin()} className="mt-6">Login with Instagram</Button>
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
            <Link href="/" className="text-sm font-semibold text-signal">InstaCity</Link>
            <h1 className="mt-2 text-4xl font-black text-white">Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
              <RefreshCw className={syncMutation.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Sync Instagram Data
            </Button>
            <Link href="/city" className="inline-flex items-center rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Enter City
            </Link>
          </div>
        </header>

        {syncMutation.isError ? <ErrorState message={syncMutation.error.message} /> : null}

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
