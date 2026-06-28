"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { importPublicInstagram } from "@/lib/api";

type PublicInstagramSelectorProps = {
  className?: string;
};

export function PublicInstagramSelector({ className }: PublicInstagramSelectorProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = identifier.trim();
    if (!value) {
      setError("Enter an Instagram profile URL or username");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await importPublicInstagram({ identifier: value });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load that public profile");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className={className}>
      <label htmlFor="instagram-public-identifier" className="text-sm font-semibold text-white">
        Instagram profile URL or username
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="instagram-public-identifier"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="e.g. humansofny or https://www.instagram.com/humansofny/"
            className="h-12 w-full rounded-md border border-white/15 bg-brand-panel/80 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-signal focus:ring-2 focus:ring-signal/30"
            autoComplete="off"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-12 px-5">
          {loading ? "Building" : "Build city"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
    </form>
  );
}
