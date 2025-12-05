import { getEventById } from "@/lib/actions";
import { notFound } from "next/navigation";
import { EventContent } from "./event-content";

type Params = Promise<{ id: string }>;

export default async function EventoPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return <EventContent event={event} />;
}
