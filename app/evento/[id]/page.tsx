import { notFound } from "next/navigation";
import { getEventById } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Gift, Plus, Settings } from "lucide-react";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export default async function EventoPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">Evento</span>
            </div>
            <Link href={`/evento/${id}/admin`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
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
              {event.wishlists.map((wishlist: { id: string; name: string }) => (
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
            <Link href={`/crear?evento=${id}`}>
              <Button className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Añadir mi lista
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Link href="/" className="mt-8 text-sm text-muted-foreground hover:text-foreground">
        Crear mi propio evento
      </Link>
    </main>
  );
}
