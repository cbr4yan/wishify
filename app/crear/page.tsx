"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowLeft, Copy, Check, Users } from "lucide-react";
import { createWishlist, getEventById } from "@/lib/actions";
import { toast } from "sonner";
import Link from "next/link";

function CrearForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("evento");

  const [eventName, setEventName] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [gifts, setGifts] = useState([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    slug: string;
    secretCode: string;
    eventId: string | null;
  } | null>(null);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  useEffect(() => {
    if (eventId) {
      getEventById(eventId).then((event) => {
        if (event) {
          setEventName(event.name);
        }
      });
    }
  }, [eventId]);

  const addGift = () => setGifts([...gifts, ""]);

  const removeGift = (index: number) => {
    if (gifts.length > 1) {
      setGifts(gifts.filter((_, i) => i !== index));
    }
  };

  const updateGift = (index: number, value: string) => {
    const newGifts = [...gifts];
    newGifts[index] = value;
    setGifts(newGifts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Ingresa tu nombre");
      return;
    }

    const validGifts = gifts.filter((g) => g.trim());
    if (validGifts.length === 0) {
      toast.error("Añade al menos un regalo");
      return;
    }

    setIsLoading(true);

    try {
      const response = await createWishlist(name.trim(), validGifts, eventId || undefined);

      if (response.error) {
        toast.error(response.error);
      } else if (response.slug && response.secretCode) {
        setResult({
          slug: response.slug,
          secretCode: response.secretCode,
          eventId: response.eventId || null,
        });
        toast.success("¡Lista creada!");
      }
    } catch {
      toast.error("Error al crear la lista");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "link" | "code") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copiado");
    setTimeout(() => setCopied(null), 2000);
  };

  if (result) {
    const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/w/${result.slug}`;

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">¡Lista creada!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm text-muted-foreground">Enlace público para compartir</Label>
            <div className="flex gap-2 mt-2">
              <Input value={publicUrl} readOnly className="text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(publicUrl, "link")}
              >
                {copied === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <Label className="text-sm text-muted-foreground">
              Código secreto (guárdalo, solo se muestra una vez)
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-mono font-bold tracking-widest">
                {result.secretCode}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(result.secretCode, "code")}
              >
                {copied === "code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Lo necesitarás para editar o eliminar tu lista
            </p>
          </div>

          <div className="flex gap-3">
            {result.eventId ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/evento/${result.eventId}`)}
                >
                  Volver al evento
                </Button>
                <Button className="flex-1" onClick={() => router.push(`/w/${result.slug}`)}>
                  Ver mi lista
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={() => router.push("/")}>
                  Inicio
                </Button>
                <Button className="flex-1" onClick={() => router.push(`/w/${result.slug}`)}>
                  Ver mi lista
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const backUrl = eventId ? `/evento/${eventId}` : "/";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <CardTitle className="text-2xl">Crear mi lista</CardTitle>
        {eventName && (
          <CardDescription className="flex items-center gap-2 mt-2">
            <Users className="w-4 h-4" />
            Para el evento: {eventName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Tu nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Ana López"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Regalos que quieres</Label>
            <div className="space-y-3 mt-2">
              {gifts.map((gift, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Regalo ${index + 1}`}
                    value={gift}
                    onChange={(e) => updateGift(index, e.target.value)}
                  />
                  {gifts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGift(index)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addGift} className="mt-3">
              <Plus className="w-4 h-4 mr-1" />
              Añadir regalo
            </Button>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear lista"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function CrearPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Crear mi lista</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <CrearForm />
      </Suspense>
    </main>
  );
}
