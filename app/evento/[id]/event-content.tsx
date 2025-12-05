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
import { ArrowLeft, Gift, Plus, Settings, Users, Lock } from "lucide-react";
import { useUserStore } from "@/lib/store";
import Link from "next/link";
import { toast } from "sonner";

type EventData = {
  id: string;
  name: string;
  wishlists: { id: string; name: string }[];
};

export function EventContent({ event }: { event: EventData }) {
  const [mounted, setMounted] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isCreatingPin, setIsCreatingPin] = useState(false);
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
    toast.success(isCreatingPin ? "¡PIN creado!" : "¡Identificado!");
  };

  // Mientras carga, mostrar loading
  if (!mounted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-lg">
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

  // Si no tiene PIN, pedir que se identifique o cree uno
  if (!userPin) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <div className="flex items-center gap-2">
              {isCreatingPin ? (
                <Plus className="w-6 h-6 text-primary" />
              ) : (
                <Lock className="w-6 h-6 text-primary" />
              )}
              <CardTitle className="text-2xl">
                {isCreatingPin ? "Crea tu PIN" : "Identifícate"}
              </CardTitle>
            </div>
            <CardDescription>
              {isCreatingPin
                ? "Elige un PIN de 4-8 dígitos. Lo usarás para reservar regalos y poder deshacer tus reservas."
                : `Ingresa tu PIN para ver el evento ${event.name} y poder reservar regalos.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pin">
                  {isCreatingPin ? "Tu nuevo PIN (4-8 dígitos)" : "Tu PIN (4-8 dígitos)"}
                </Label>
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
              </div>
              <Button type="submit" className="w-full" size="lg">
                {isCreatingPin ? "Crear PIN y entrar" : "Entrar"}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t text-center">
              {isCreatingPin ? (
                <button
                  onClick={() => setIsCreatingPin(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Ya tengo un PIN
                </button>
              ) : (
                <button
                  onClick={() => setIsCreatingPin(true)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  No tengo PIN, crear uno nuevo
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Usuario identificado, mostrar el evento
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <Link href={`/evento/${event.id}/admin`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span className="text-sm text-muted-foreground">Evento</span>
          </div>
          <CardTitle className="text-3xl">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.wishlists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aún no hay listas en este evento</p>
              <p className="text-sm mt-1">¡Sé el primero en añadir la tuya!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {event.wishlists.map((wishlist) => (
                <li key={wishlist.id}>
                  <Link href={`/w/${wishlist.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-primary" />
                        <span className="text-lg font-medium">{wishlist.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Ver lista →</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-4 border-t">
            <Link href={`/crear?evento=${event.id}`}>
              <Button className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Añadir mi lista
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
