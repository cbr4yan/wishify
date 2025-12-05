import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h1 className="text-3xl font-bold mb-2">Lista no encontrada</h1>
        <p className="text-muted-foreground mb-8">
          Esta lista no existe o ha sido eliminada.
        </p>
        <Link href="/">
          <Button>Crear mi lista</Button>
        </Link>
      </div>
    </main>
  );
}

