export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-300">
      <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-signal border-t-transparent shadow-[0_0_16px_rgba(255,47,135,0.45)]" />
      {label}
    </div>
  );
}
