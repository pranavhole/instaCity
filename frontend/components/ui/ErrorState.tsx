export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-lg border border-coral/40 bg-coral/10 p-4 text-sm text-red-100">{message}</div>;
}
