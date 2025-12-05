"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReservationStore {
  reservedGifts: string[];
  addReservation: (giftId: string) => void;
  removeReservation: (giftId: string) => void;
  hasReserved: (giftId: string) => boolean;
}

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      reservedGifts: [],
      addReservation: (giftId: string) =>
        set((state) => ({
          reservedGifts: [...state.reservedGifts, giftId],
        })),
      removeReservation: (giftId: string) =>
        set((state) => ({
          reservedGifts: state.reservedGifts.filter((id) => id !== giftId),
        })),
      hasReserved: (giftId: string) => get().reservedGifts.includes(giftId),
    }),
    {
      name: "wishify-reservations",
    }
  )
);
