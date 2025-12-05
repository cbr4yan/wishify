"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReservationStore {
  reservedGifts: string[]; // Array de IDs de regalos reservados en esta sesión
  addReservation: (giftId: string) => void;
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
      hasReserved: (giftId: string) => get().reservedGifts.includes(giftId),
    }),
    {
      name: "wishify-reservations",
    }
  )
);

