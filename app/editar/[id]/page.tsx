"use client";

import { useState, useEffect, use } from "react";
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
import { Plus, Trash2, ArrowLeft, Link2 } from "lucide-react";
import {
  getWishlistById,
  verifySecretCode,
  updateWishlist,
  deleteWishlist,
} from "@/lib/actions";
import { toast } from "sonner";
import Link from "next/link";

type Params = Promise<{ id: string }>;
type GiftInput = { name: string; url: string };

export default function EditarPage({ params }: { params: Params }) {
  const { id } = use(params);
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [name, setName] = useState("");
  const [gifts, setGifts] = useState<GiftInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (isVerified) {
      getWishlistById(id).then((wishlist) => {
        if (wishlist) {
          setName(wishlist.name);
          setGifts(
            wishlist.gifts.map((g: { name: string; url: string | null }) => ({
              name: g.name,
              url: g.url || "",
            }))
          );
        }
      });
    }
  }, [isVerified, id]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      toast.error("El PIN debe tener al menos 4 dígitos");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifySecretCode(id, code);
      if (result.valid) {
        setIsVerified(true);
        toast.success("PIN verificado");
      } else {
        toast.error(result.error || "PIN incorrecto");
      }
    } catch {
      toast.error("Error al verificar");
    } finally {
      setIsVerifying(false);
    }
  };

  const addGift = () => setGifts([...gifts, { name: "", url: "" }]);

  const removeGift = (index: number) => {
    if (gifts.length > 1) {
      setGifts(gifts.filter((_, i) => i !== index));
    }
  };

  const updateGift = (index: number, field: keyof GiftInput, value: string) => {
    const newGifts = [...gifts];
    newGifts[index] = { ...newGifts[index], [field]: value };
    setGifts(newGifts);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Ingresa tu nombre");
      return;
    }

    const validGifts = gifts.filter((g) => g.name.trim());
    if (validGifts.length === 0) {
      toast.error("Añade al menos un regalo");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateWishlist(id, code, name.trim(), validGifts);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Lista actualizada");
        router.push(`/w/${id}`);
      }
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteWishlist(id, code);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Lista eliminada");
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
              href={`/w/${id}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la lista
            </Link>
            <CardTitle className="text-2xl">Editar lista</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label htmlFor="code">Tu PIN secreto</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  placeholder="••••••"
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
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Link
            href={`/w/${id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la lista
          </Link>
          <CardTitle className="text-2xl">Editar lista</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <Label htmlFor="name">Tu nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Regalos</Label>
              <div className="space-y-4 mt-2">
                {gifts.map((gift, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Regalo ${index + 1}`}
                        value={gift.name}
                        onChange={(e) => updateGift(index, "name", e.target.value)}
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
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input
                        placeholder="Link de referencia (opcional)"
                        value={gift.url}
                        onChange={(e) => updateGift(index, "url", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addGift} className="mt-3">
                <Plus className="w-4 h-4 mr-1" />
                Añadir regalo
              </Button>
            </div>

            <div className="flex gap-3">
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="flex-1">
                    Eliminar lista
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Eliminar lista?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente tu lista de
                      regalos.
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

              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

