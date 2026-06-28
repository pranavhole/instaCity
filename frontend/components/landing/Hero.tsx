"use client";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { PublicInstagramSelector } from "@/components/instagram/PublicInstagramSelector";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-asphalt bg-brand-radial city-grid">
      <div className="mx-auto grid min-h-[88vh] max-w-7xl gap-10 px-6 pb-14 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <BrandLogo className="mb-8" />
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-normal text-white md:text-7xl">
            Turn your Instagram profile into a neon 3D city
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Enter a public profile URL or username, cache its Apify scraper results, and watch posts become a building people can fly around and visit.
          </p>
          <div className="mt-8 max-w-2xl">
            <PublicInstagramSelector />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/city" className="inline-flex items-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Explore city
            </a>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-brand-panel/70 p-6 shadow-glow">
          <div className="absolute left-6 top-6 text-xs font-semibold uppercase tracking-[0.2em] text-signal">Live preview</div>
          <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-gradient opacity-90 blur-[1px]" />
          <div className="absolute bottom-0 left-0 right-0 flex h-[78%] items-end justify-center gap-3 px-8">
            {[
              ["h-28", "bg-[#211936]"],
              ["h-44", "bg-signal"],
              ["h-64", "bg-skyline"],
              ["h-36", "bg-coral"],
              ["h-56", "bg-amethyst"],
              ["h-72", "bg-[#ff7a45]"],
              ["h-40", "bg-[#321653]"]
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
          <div className="absolute bottom-12 left-1/2 h-36 w-28 -translate-x-1/2 rounded-t-full bg-brand-gradient shadow-[0_0_34px_rgba(255,47,135,0.34)]" />
          <div className="absolute bottom-[5.4rem] left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-asphalt" />
        </div>
      </div>
    </section>
  );
}
