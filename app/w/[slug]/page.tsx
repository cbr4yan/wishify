import { notFound } from "next/navigation";
import { getWishlistBySlug } from "@/lib/actions";
import { GiftList } from "./gift-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift, Settings, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Params = Promise<{ slug: string }>;

export default async function WishlistPage({ params }: { params: Params }) {
  const { slug } = await params;
  const wishlist = await getWishlistBySlug(slug);

  if (!wishlist) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">Lista de regalos de</span>
            </div>
            <Link href={`/editar/${slug}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <CardTitle className="text-3xl">{wishlist.name}</CardTitle>
          {wishlist.event && (
            <CardDescription>
              <Link
                href={`/evento/${wishlist.event.id}`}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Users className="w-4 h-4" />
                {wishlist.event.name}
              </Link>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <GiftList gifts={wishlist.gifts} />
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col items-center gap-2">
        {wishlist.event ? (
          <Link
            href={`/evento/${wishlist.event.id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Ver otras listas del evento
          </Link>
        ) : (
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Crear mi propia lista
          </Link>
        )}
      </div>
    </main>
  );
}
