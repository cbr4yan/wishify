import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWishlistById } from "@/lib/actions";
import { ArrowLeft, Gift, Settings, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GiftList } from "./gift-list";

type Params = Promise<{ id: string }>;

export default async function WishlistPage({ params }: { params: Params }) {
  const { id } = await params;
  const wishlist = await getWishlistById(id);

  if (!wishlist) {
    notFound();
  }

  const backUrl = wishlist.event ? `/evento/${wishlist.event.id}` : "/";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <Link href={`/editar/${id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-sm text-muted-foreground">
              Lista de regalos de
            </span>
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
    </main>
  );
}
