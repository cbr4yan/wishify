"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Check, Users } from "lucide-react";
import { createEvent } from "@/lib/actions";
import { toast } from "sonner";
import Link from "next/link";

export default function CrearEventoPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ slug: string; secretCode: string } | null>(null);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Ingresa el nombre del evento");
      return;
    }

    setIsLoading(true);

    try {
      const response = await createEvent(name.trim());

      if (response.error) {
        toast.error(response.error);
      } else if (response.slug && response.secretCode) {
        setResult({ slug: response.slug, secretCode: response.secretCode });
        toast.success("¡Evento creado!");
      }
    } catch {
      toast.error("Error al crear el evento");
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
    const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/evento/${result.slug}`;

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">¡Evento creado!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm text-muted-foreground">
                Enlace del evento (compártelo para que añadan sus listas)
              </Label>
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
                Código secreto del evento (solo se muestra una vez)
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
                Lo necesitarás para eliminar el evento
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/")}>
                Inicio
              </Button>
              <Button className="flex-1" onClick={() => router.push(`/evento/${result.slug}`)}>
                Ver evento
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">Crear evento</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Un evento agrupa las listas de varias personas
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Nombre del evento</Label>
              <Input
                id="name"
                placeholder="Ej: Navidad Familia García 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear evento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

