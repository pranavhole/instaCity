import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-glow backdrop-blur", className)}>{children}</div>;
}
