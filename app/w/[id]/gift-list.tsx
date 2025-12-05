"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { reserveGift, unreserveGift } from "@/lib/actions";
import type { Gift } from "@/lib/supabase";
import { Check, ExternalLink, Gift as GiftIcon, Undo2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type Props = {
  gifts: Gift[];
  userPin: string;
};

export function GiftList({ gifts, userPin }: Props) {
  const [localGifts, setLocalGifts] = useState(gifts);
  const [isPending, startTransition] = useTransition();
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    setLocalGifts(gifts);
  }, [gifts]);

  const handleReserve = (giftId: string) => {
    setLocalGifts((prev) =>
      prev.map((g) =>
        g.id === giftId ? { ...g, reserved: true, reserved_by: userPin } : g
      )
    );
    toast.success("¡Reservado! Nadie más verá que fuiste tú.");

    startTransition(async () => {
      const result = await reserveGift(giftId, userPin);
      if (!result.success) {
        setLocalGifts((prev) =>
          prev.map((g) =>
            g.id === giftId ? { ...g, reserved: false, reserved_by: null } : g
          )
        );
        toast.error(result.error || "Error al reservar. Intenta de nuevo.");
      }
    });
  };

  const handleUnreserve = (giftId: string) => {
    setLocalGifts((prev) =>
      prev.map((g) =>
        g.id === giftId ? { ...g, reserved: false, reserved_by: null } : g
      )
    );
    toast.success("Reserva cancelada");

    startTransition(async () => {
      const result = await unreserveGift(giftId, userPin);
      if (!result.success) {
        setLocalGifts((prev) =>
          prev.map((g) =>
            g.id === giftId ? { ...g, reserved: true, reserved_by: userPin } : g
          )
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
    <>
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
              <div className="flex gap-3">
                {/* Miniatura de la imagen */}
                {gift.image_url && (
                  <button
                    type="button"
                    onClick={() => setSelectedImage({ url: gift.image_url!, name: gift.name })}
                    className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={gift.image_url}
                      alt={gift.name}
                      fill
                      className={`object-cover ${isReserved ? "opacity-50" : ""}`}
                    />
                  </button>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-center">
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
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver referencia
                    </a>
                  )}
                </div>

                <div className="flex items-center shrink-0">
                  {isReserved ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        {wasReservedByMe ? "Tú" : "Reservado"}
                      </span>
                      {wasReservedByMe && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnreserve(gift.id)}
                          disabled={isPending}
                          className="h-7 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Undo2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
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
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Dialog para ver imagen en grande */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl p-2">
          <DialogTitle className="sr-only">{selectedImage?.name}</DialogTitle>
          {selectedImage && (
            <div className="relative aspect-square w-full">
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                fill
                className="object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
