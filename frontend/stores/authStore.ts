import { create } from "zustand";

import type { InstagramAccount, User } from "@/lib/types";

type AuthState = {
  user: User | null;
  account: InstagramAccount | null;
  setSession: (user: User | null, account: InstagramAccount | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  account: null,
  setSession: (user, account) => set({ user, account }),
  clearSession: () => set({ user: null, account: null })
}));
