"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Gift as GiftIcon, Check, ExternalLink, Undo2 } from "lucide-react";
import { reserveGift, unreserveGift } from "@/lib/actions";
import { useReservationStore } from "@/lib/store";
import { toast } from "sonner";
import type { Gift } from "@/lib/supabase";

export function GiftList({ gifts }: { gifts: Gift[] }) {
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [unreservedIds, setUnreservedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { addReservation, removeReservation, reservedGifts } = useReservationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReserve = (giftId: string) => {
    // Optimistic update
    setReservedIds((prev) => [...prev, giftId]);
    setUnreservedIds((prev) => prev.filter((id) => id !== giftId));
    addReservation(giftId);
    toast.success("¡Reservado! Nadie más verá que fuiste tú.");

    startTransition(async () => {
      const result = await reserveGift(giftId);
      if (!result.success) {
        setReservedIds((prev) => prev.filter((id) => id !== giftId));
        removeReservation(giftId);
        toast.error("Error al reservar. Intenta de nuevo.");
      }
    });
  };

  const handleUnreserve = (giftId: string) => {
    // Optimistic update
    setUnreservedIds((prev) => [...prev, giftId]);
    setReservedIds((prev) => prev.filter((id) => id !== giftId));
    removeReservation(giftId);
    toast.success("Reserva cancelada");

    startTransition(async () => {
      const result = await unreserveGift(giftId);
      if (!result.success) {
        setUnreservedIds((prev) => prev.filter((id) => id !== giftId));
        addReservation(giftId);
        toast.error("Error al cancelar. Intenta de nuevo.");
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
        const wasReservedByMe = mounted && reservedGifts.includes(gift.id);
        const isUnreserved = unreservedIds.includes(gift.id);
        const isReserved =
          (gift.reserved || reservedIds.includes(gift.id)) && !isUnreserved;

        return (
          <li
            key={gift.id}
            className={`p-3 rounded-lg border transition-colors ${
              isReserved ? "bg-muted/50" : "bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span
                  className={`text-lg block transition-all ${
                    isReserved ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {gift.name}
                </span>
                {gift.url && (
                  <a
                    href={gift.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver referencia
                  </a>
                )}
              </div>

              {isReserved ? (
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {wasReservedByMe ? "Lo regalas tú" : "Reservado"}
                  </span>
                  {wasReservedByMe && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUnreserve(gift.id)}
                      disabled={isPending}
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    >
                      <Undo2 className="w-3 h-3 mr-1" />
                      Deshacer
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReserve(gift.id)}
                  disabled={isPending}
                  className="shrink-0 ml-3"
                >
                  Yo lo regalo
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
