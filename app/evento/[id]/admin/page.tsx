"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { verifyEventSecretCode, deleteEvent } from "@/lib/actions";
import { toast } from "sonner";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export default function AdminEventoPage({ params }: { params: Params }) {
  const { id } = use(params);
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("El código debe tener 6 dígitos");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyEventSecretCode(id, code);
      if (result.valid) {
        setIsVerified(true);
        toast.success("Código verificado");
      } else {
        toast.error(result.error || "Código incorrecto");
      }
    } catch {
      toast.error("Error al verificar");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteEvent(id, code);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Evento eliminado");
        router.push("/");
      }
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!isVerified) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Link
              href={`/evento/${id}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al evento
            </Link>
            <CardTitle className="text-2xl">Administrar evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label htmlFor="code">Código secreto del evento</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 text-center text-2xl font-mono tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? "Verificando..." : "Verificar"}
              </Button>
            </form>
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
            href={`/evento/${id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al evento
          </Link>
          <CardTitle className="text-2xl">Administrar evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Por ahora solo puedes eliminar el evento. Esto eliminará también todas las listas
            asociadas.
          </p>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Eliminar evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar evento?</DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el evento y todas
                  las listas de regalos asociadas.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  );
}

