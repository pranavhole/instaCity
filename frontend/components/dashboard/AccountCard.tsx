import { Instagram } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { profileInitials } from "@/lib/profile-fallback";
import type { InstagramAccount, User } from "@/lib/types";

export function AccountCard({ user, account }: { user: User | null; account: InstagramAccount | null }) {
  const displayName = account?.username ?? user?.display_name ?? "No profile";
  const initials = profileInitials(displayName);

  return (
    <Card className="flex items-center gap-4">
      <RemoteImage
        src={account?.profile_picture_url}
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-gradient p-[2px]"
        imageClassName="h-full w-full rounded-[0.4rem] object-cover"
        fallback={<div className="flex h-full w-full items-center justify-center rounded-[0.4rem] bg-brand-panel text-lg font-black text-white">{initials}</div>}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Instagram className="h-4 w-4 text-signal" />
          Cached public profile
        </div>
        <h2 className="truncate text-2xl font-bold text-white">@{displayName}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {account?.category ?? "No profile selected"} {account?.last_synced_at ? `- updated ${new Date(account.last_synced_at).toLocaleString()}` : ""}
        </p>
      </div>
    </Card>
  );
}
