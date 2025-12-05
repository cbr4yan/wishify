"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Gift as GiftIcon, Check } from "lucide-react";
import { reserveGift } from "@/lib/actions";
import { useReservationStore } from "@/lib/store";
import { toast } from "sonner";
import type { Gift } from "@/lib/supabase";

export function GiftList({ gifts }: { gifts: Gift[] }) {
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { addReservation, reservedGifts } = useReservationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReserve = (giftId: string) => {
    // Optimistic update: marcar inmediatamente como reservado
    setReservedIds((prev) => [...prev, giftId]);
    addReservation(giftId);
    toast.success("¡Reservado! Nadie más verá que fuiste tú.");

    // Llamar al servidor en background
    startTransition(async () => {
      const result = await reserveGift(giftId);
      if (!result.success) {
        // Revertir si falla
        setReservedIds((prev) => prev.filter((id) => id !== giftId));
        toast.error("Error al reservar. Intenta de nuevo.");
      }
    });
  };

  if (gifts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <GiftIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Esta lista está vacía</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {gifts.map((gift) => {
        const isReserved = gift.reserved || reservedIds.includes(gift.id);
        const wasReservedByMe = mounted && reservedGifts.includes(gift.id);

        return (
          <li
            key={gift.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              isReserved ? "bg-muted/50" : "bg-card"
            }`}
          >
            <span
              className={`flex-1 text-lg transition-all ${
                isReserved ? "line-through text-muted-foreground" : ""
              }`}
            >
              {gift.name}
            </span>

            {isReserved ? (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Check className="w-4 h-4" />
                {wasReservedByMe ? "Lo regalas tú" : "Reservado"}
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReserve(gift.id)}
                disabled={isPending}
              >
                Yo lo regalo
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
