import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  name: string;
  role: "super_admin" | "admin" | "agent";
  branchId?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,

      login: (token, user) => {
        localStorage.setItem("token", token); // persist token
        set({ token, user });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null });
      },

      fetchMe: async () => {
       

        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          set({ user: null });
          return;
        }

        const data = await res.json();
        set({ user: data.user });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    }
  )
);
