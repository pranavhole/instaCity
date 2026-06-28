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
        variant === "primary" && "bg-brand-gradient text-white shadow-[0_0_24px_rgba(255,47,135,0.22)] hover:brightness-110",
        variant === "secondary" && "border border-white/15 bg-white/[0.08] text-white hover:border-signal/50 hover:bg-white/[0.12]",
        variant === "ghost" && "text-slate-200 hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
