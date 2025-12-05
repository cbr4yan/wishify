"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Gift, Settings, Users, Lock } from "lucide-react";
import { useUserStore } from "@/lib/store";
import { GiftList } from "./gift-list";
import Link from "next/link";
import { toast } from "sonner";
import type { Gift as GiftType } from "@/lib/supabase";

type WishlistData = {
  id: string;
  name: string;
  gifts: GiftType[];
  event: { id: string; name: string } | null;
};

export function WishlistContent({ wishlist }: { wishlist: WishlistData }) {
  const [mounted, setMounted] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const { userPin, setUserPin } = useUserStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4 || pinInput.length > 8) {
      toast.error("El PIN debe tener entre 4 y 8 dígitos");
      return;
    }
    setUserPin(pinInput);
    toast.success("¡Identificado!");
  };

  const backUrl = wishlist.event ? `/evento/${wishlist.event.id}` : "/";

  // Mientras carga, mostrar loading
  if (!mounted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-8 bg-muted rounded w-2/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Si no tiene PIN, pedir que se identifique
  if (!userPin) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Link
              href={backUrl}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Identifícate</CardTitle>
            </div>
            <CardDescription>
              Ingresa tu PIN para ver la lista de <strong>{wishlist.name}</strong> y poder reservar
              regalos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pin">Tu PIN (4-8 dígitos)</Label>
                <Input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  placeholder="••••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 text-center text-2xl font-mono tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Es el mismo PIN que usas para crear listas
                </p>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Usuario identificado, mostrar la lista
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <Link href={`/editar/${wishlist.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-sm text-muted-foreground">Lista de regalos de</span>
          </div>
          <CardTitle className="text-3xl">{wishlist.name}</CardTitle>
          {wishlist.event && (
            <CardDescription>
              <Link
                href={`/evento/${wishlist.event.id}`}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Users className="w-4 h-4" />
                {wishlist.event.name}
              </Link>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <GiftList gifts={wishlist.gifts} userPin={userPin} />
        </CardContent>
      </Card>
    </main>
  );
}

