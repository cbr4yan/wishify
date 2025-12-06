"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteWishlist,
  getWishlistById,
  updateWishlist,
  uploadGiftImage,
  verifySecretCode,
} from "@/lib/actions";
import { ArrowLeft, ImagePlus, Link2, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Params = Promise<{ id: string }>;
type GiftInput = { id?: string; name: string; url: string; imageUrl: string };

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
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isVerified) {
      getWishlistById(id).then((wishlist) => {
        if (wishlist) {
          setName(wishlist.name);
          setGifts(
            wishlist.gifts.map(
              (g: {
                id: string;
                name: string;
                url: string | null;
                image_url: string | null;
              }) => ({
                id: g.id, // Mantener el ID para actualizar sin perder reservas
                name: g.name,
                url: g.url || "",
                imageUrl: g.image_url || "",
              })
            )
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

  const addGift = () =>
    setGifts([...gifts, { name: "", url: "", imageUrl: "" }]);

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

  const handleImageUpload = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5MB");
      return;
    }

    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadGiftImage(formData);

    if (result.error) {
      toast.error(result.error);
    } else if (result.url) {
      updateGift(index, "imageUrl", result.url);
      toast.success("Imagen subida");
    }

    setUploadingIndex(null);
  };

  const removeImage = (index: number) => {
    updateGift(index, "imageUrl", "");
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
                        onChange={(e) =>
                          updateGift(index, "name", e.target.value)
                        }
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
                        onChange={(e) =>
                          updateGift(index, "url", e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>

                    {/* Imagen */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => {
                          fileInputRefs.current[index] = el;
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file);
                        }}
                        className="hidden"
                      />

                      {gift.imageUrl ? (
                        <div className="relative w-full">
                          <div className="relative h-32 w-full rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={gift.imageUrl}
                              alt={gift.name || "Regalo"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={uploadingIndex === index}
                          onClick={() => fileInputRefs.current[index]?.click()}
                        >
                          <ImagePlus className="w-4 h-4 mr-2" />
                          {uploadingIndex === index
                            ? "Subiendo..."
                            : "Añadir foto (opcional)"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGift}
                className="mt-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir regalo
              </Button>
            </div>

            <div className="flex gap-3">
              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="flex-1">
                    Eliminar lista
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Eliminar lista?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer. Se eliminará
                      permanentemente tu lista de regalos.
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
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
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
