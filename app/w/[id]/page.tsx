import { getWishlistById } from "@/lib/actions";
import { notFound } from "next/navigation";
import { WishlistContent } from "./wishlist-content";

type Params = Promise<{ id: string }>;

export default async function WishlistPage({ params }: { params: Params }) {
  const { id } = await params;
  const wishlist = await getWishlistById(id);

  if (!wishlist) {
    notFound();
  }

  return <WishlistContent wishlist={wishlist} />;
}
