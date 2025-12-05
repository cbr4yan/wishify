import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h1 className="text-3xl font-bold mb-2">Evento no encontrado</h1>
        <p className="text-muted-foreground mb-8">
          Este evento no existe o ha sido eliminado.
        </p>
        <Link href="/">
          <Button>Crear un evento</Button>
        </Link>
      </div>
    </main>
  );
}

