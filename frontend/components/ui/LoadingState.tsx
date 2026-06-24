export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-300">
      <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-signal border-t-transparent" />
      {label}
    </div>
  );
}
