import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-signal disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-signal text-asphalt hover:bg-[#4ee6ca]",
        variant === "secondary" && "border border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.12]",
        variant === "ghost" && "text-slate-200 hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
