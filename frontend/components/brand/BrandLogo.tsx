import { clsx } from "clsx";

import { brandName, brandPalette, brandTagline } from "@/lib/brand";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  const gradientId = compact ? "oinsta-city-compact-gradient" : "oinsta-city-gradient";

  return (
    <div className={clsx("inline-flex items-center gap-3", className)} aria-label={`${brandName} logo`}>
      <svg
        aria-hidden="true"
        className={compact ? "h-11 w-11" : "h-16 w-16"}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="30" y1="12" x2="88" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor={brandPalette.sunrise} />
            <stop offset="0.52" stopColor={brandPalette.neonPink} />
            <stop offset="1" stopColor={brandPalette.violet} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="48" r="38" fill={`url(#${gradientId})`} />
        <path
          d="M24 63h8V48h12v15h7V31h10v32h7V41h10v22h7V51h10v12h6v13H24V63Z"
          fill={brandPalette.ink}
        />
        <path
          d="M60 47c-17 0-31 13-31 30 0 23 31 42 31 42s31-19 31-42c0-17-14-30-31-30Z"
          fill={`url(#${gradientId})`}
        />
        <circle cx="60" cy="76" r="13" fill={brandPalette.ink} />
        <path
          d="M32 92c10 12 46 12 56 0M42 98c8 8 28 8 36 0"
          stroke={`url(#${gradientId})`}
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.72"
        />
      </svg>
      <div className={compact ? "leading-none" : "leading-tight"}>
        <div className={compact ? "text-lg font-black tracking-[0.18em] text-white" : "text-2xl font-black tracking-[0.22em] text-white"}>
          OINSTA <span className="bg-brand-gradient bg-clip-text text-transparent">CITY</span>
        </div>
        {!compact ? (
          <div className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-brand-muted">
            {brandTagline}
          </div>
        ) : null}
      </div>
    </div>
  );
}

