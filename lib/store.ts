"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  userPin: string | null;
  setUserPin: (pin: string) => void;
  clearUserPin: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userPin: null,
      setUserPin: (pin: string) => set({ userPin: pin }),
      clearUserPin: () => set({ userPin: null }),
    }),
    {
      name: "wishify-user",
    }
  )
);
