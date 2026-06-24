"use client";

import { ArrowRight, Instagram } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { startInstagramLogin } from "@/lib/auth";

export function Hero() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      await startInstagramLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Instagram login");
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden city-grid">
      <div className="mx-auto grid min-h-[88vh] max-w-7xl gap-10 px-6 pb-14 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-medium text-slate-200">
            InstaCity social skyline
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-normal text-white md:text-7xl">
            Turn your Instagram profile into a living 3D city
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Connect your account, sync professional profile metrics, and watch your creator footprint become a building people can fly around and visit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={handleLogin} disabled={loading} className="px-5 py-3">
              <Instagram className="h-5 w-5" />
              {loading ? "Opening Instagram" : "Login with Instagram"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <a href="/city" className="inline-flex items-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Explore seeded city
            </a>
          </div>
          {error ? <p className="mt-4 text-sm text-coral">{error}</p> : null}
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-[#111922] p-6 shadow-glow">
          <div className="absolute left-6 top-6 text-xs font-semibold uppercase tracking-[0.2em] text-signal">Live preview</div>
          <div className="absolute bottom-0 left-0 right-0 flex h-[78%] items-end justify-center gap-3 px-8">
            {[
              ["h-28", "bg-slate-500"],
              ["h-44", "bg-signal"],
              ["h-64", "bg-skyline"],
              ["h-36", "bg-coral"],
              ["h-56", "bg-slate-300"],
              ["h-72", "bg-[#f4c430]"],
              ["h-40", "bg-[#8338ec]"]
            ].map(([height, color], index) => (
              <div key={index} className={`w-12 rounded-t-md ${height} ${color} relative opacity-90`}>
                <div className="absolute inset-x-2 top-4 grid grid-cols-2 gap-1">
                  {Array.from({ length: 10 }).map((_, windowIndex) => (
                    <span key={windowIndex} className="h-1.5 rounded-sm bg-white/45" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-20 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-8deg] rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.35)]" />
        </div>
      </div>
    </section>
  );
}
