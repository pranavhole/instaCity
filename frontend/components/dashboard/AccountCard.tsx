import { Instagram, UserRound } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { InstagramAccount, User } from "@/lib/types";

export function AccountCard({ user, account }: { user: User | null; account: InstagramAccount | null }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
        {account?.profile_picture_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={account.profile_picture_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-8 w-8 text-slate-300" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Instagram className="h-4 w-4 text-signal" />
          Connected Instagram
        </div>
        <h2 className="truncate text-2xl font-bold text-white">@{account?.username ?? user?.display_name ?? "Not connected"}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {account?.category ?? "Mock local account"} {account?.last_synced_at ? `- synced ${new Date(account.last_synced_at).toLocaleString()}` : ""}
        </p>
      </div>
    </Card>
  );
}
