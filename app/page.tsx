import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Gift className="w-12 h-12 text-primary" strokeWidth={1.5} />
          <h1 className="text-6xl font-bold tracking-tight">Wishify</h1>
        </div>

        <p className="text-xl text-muted-foreground mb-12">
          Crea tu lista de regalos y compártela.
          <br />
          <span className="text-lg">Otros pueden reservar anónimamente lo que van a regalar.</span>
        </p>

        <div className="flex flex-col gap-4">
          <Link href="/crear">
            <Button size="lg" className="text-lg px-8 py-6 h-auto w-full">
              <Gift className="w-5 h-5 mr-2" />
              Crear mi lista
            </Button>
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <Link href="/evento/crear">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto w-full">
              <Users className="w-5 h-5 mr-2" />
              Crear un evento
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Un evento agrupa las listas de varias personas
          </p>
        </div>
      </div>
    </main>
  );
}
