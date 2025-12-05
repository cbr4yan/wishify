"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Gift as GiftIcon, Check, ExternalLink, Undo2, Lock } from "lucide-react";
import { reserveGift, unreserveGift } from "@/lib/actions";
import { useUserStore } from "@/lib/store";
import { toast } from "sonner";
import type { Gift } from "@/lib/supabase";

export function GiftList({ gifts }: { gifts: Gift[] }) {
  const [localGifts, setLocalGifts] = useState(gifts);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pendingGiftId, setPendingGiftId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");

  const { userPin, setUserPin } = useUserStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocalGifts(gifts);
  }, [gifts]);

  const handleReserveClick = (giftId: string) => {
    if (mounted && userPin) {
      doReserve(giftId, userPin);
    } else {
      setPendingGiftId(giftId);
      setPinDialogOpen(true);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput.length < 4 || pinInput.length > 8) {
      toast.error("El PIN debe tener entre 4 y 8 dígitos");
      return;
    }

    setUserPin(pinInput);
    setPinDialogOpen(false);

    if (pendingGiftId) {
      doReserve(pendingGiftId, pinInput);
      setPendingGiftId(null);
    }

    setPinInput("");
  };

  const doReserve = (giftId: string, pin: string) => {
    // Optimistic update
    setLocalGifts((prev) =>
      prev.map((g) => (g.id === giftId ? { ...g, reserved: true, reserved_by: pin } : g))
    );
    toast.success("¡Reservado! Nadie más verá que fuiste tú.");

    startTransition(async () => {
      const result = await reserveGift(giftId, pin);
      if (!result.success) {
        // Revertir si falla
        setLocalGifts((prev) =>
          prev.map((g) => (g.id === giftId ? { ...g, reserved: false, reserved_by: null } : g))
        );
        toast.error(result.error || "Error al reservar. Intenta de nuevo.");
      }
    });
  };

  const handleUnreserve = (giftId: string) => {
    if (!mounted || !userPin) return;

    // Optimistic update
    setLocalGifts((prev) =>
      prev.map((g) => (g.id === giftId ? { ...g, reserved: false, reserved_by: null } : g))
    );
    toast.success("Reserva cancelada");

    startTransition(async () => {
      const result = await unreserveGift(giftId, userPin);
      if (!result.success) {
        // Revertir si falla
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
    <>
      <ul className="space-y-3">
        {localGifts.map((gift) => {
          const isReserved = gift.reserved;
          const wasReservedByMe = mounted && userPin && gift.reserved_by === userPin;

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
                    onClick={() => handleReserveClick(gift.id)}
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

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Ingresa tu PIN
            </DialogTitle>
            <DialogDescription>
              Tu PIN te identifica para poder deshacer tus reservas después.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="pin-input">PIN (4-8 dígitos)</Label>
            <Input
              id="pin-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="••••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
              className="mt-2 text-center text-xl font-mono tracking-widest"
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPinDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePinSubmit}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
