"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/ui/LoadingState";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.replace("/dashboard"), 600);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-asphalt px-6">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6 text-center">
        <h1 className="text-2xl font-bold text-white">Connecting Instagram</h1>
        <LoadingState label="Finishing secure sign in" />
      </div>
    </main>
  );
}
