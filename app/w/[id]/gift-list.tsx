"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Gift as GiftIcon, Check, ExternalLink, Undo2 } from "lucide-react";
import { reserveGift, unreserveGift } from "@/lib/actions";
import { toast } from "sonner";
import type { Gift } from "@/lib/supabase";

type Props = {
  gifts: Gift[];
  userPin: string;
};

export function GiftList({ gifts, userPin }: Props) {
  const [localGifts, setLocalGifts] = useState(gifts);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalGifts(gifts);
  }, [gifts]);

  const handleReserve = (giftId: string) => {
    // Optimistic update
    setLocalGifts((prev) =>
      prev.map((g) => (g.id === giftId ? { ...g, reserved: true, reserved_by: userPin } : g))
    );
    toast.success("¡Reservado! Nadie más verá que fuiste tú.");

    startTransition(async () => {
      const result = await reserveGift(giftId, userPin);
      if (!result.success) {
        setLocalGifts((prev) =>
          prev.map((g) => (g.id === giftId ? { ...g, reserved: false, reserved_by: null } : g))
        );
        toast.error(result.error || "Error al reservar. Intenta de nuevo.");
      }
    });
  };

  const handleUnreserve = (giftId: string) => {
    // Optimistic update
    setLocalGifts((prev) =>
      prev.map((g) => (g.id === giftId ? { ...g, reserved: false, reserved_by: null } : g))
    );
    toast.success("Reserva cancelada");

    startTransition(async () => {
      const result = await unreserveGift(giftId, userPin);
      if (!result.success) {
        setLocalGifts((prev) =>
          prev.map((g) => (g.id === giftId ? { ...g, reserved: true, reserved_by: userPin } : g))
        );
        toast.error(result.error || "Error al cancelar. Intenta de nuevo.");
      }
    });
  };

  if (localGifts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <GiftIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Esta lista está vacía</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {localGifts.map((gift) => {
        const isReserved = gift.reserved;
        const wasReservedByMe = gift.reserved_by === userPin;

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
