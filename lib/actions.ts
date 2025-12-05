"use server";

import { createId } from "@paralleldrive/cuid2";
import { supabase } from "./supabase";

// Generar slug a partir del nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Generar código secreto de 6 dígitos
function generateSecretCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== EVENTOS ====================

// Crear un nuevo evento
export async function createEvent(name: string) {
  const id = createId();
  const secretCode = generateSecretCode();

  const { error } = await supabase
    .from("events")
    .insert({ id, name, secret_code: secretCode });

  if (error) {
    return { error: "Error al crear el evento" };
  }

  return {
    id,
    secretCode,
  };
}

// Obtener evento por ID con sus listas
export async function getEventById(id: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    return null;
  }

  const { data: wishlists } = await supabase
    .from("wishlists")
    .select("id, slug, name, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  return {
    ...event,
    wishlists: wishlists || [],
  };
}

// Verificar código secreto del evento
export async function verifyEventSecretCode(id: string, code: string) {
  const { data: event } = await supabase
    .from("events")
    .select("id, secret_code")
    .eq("id", id)
    .single();

  if (!event) {
    return { valid: false, error: "Evento no encontrado" };
  }

  if (event.secret_code !== code) {
    return { valid: false, error: "Código incorrecto" };
  }

  return { valid: true, eventId: event.id };
}

// Eliminar evento
export async function deleteEvent(id: string, code: string) {
  const verification = await verifyEventSecretCode(id, code);
  if (!verification.valid) {
    return { error: verification.error };
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", verification.eventId);

  if (error) {
    return { error: "Error al eliminar" };
  }

  return { success: true };
}

// ==================== WISHLISTS ====================

// Crear una nueva lista (opcionalmente dentro de un evento)
export async function createWishlist(
  name: string,
  gifts: string[],
  eventId?: string
) {
  const id = createId();
  const baseSlug = generateSlug(name);
  const secretCode = generateSecretCode();

  // Verificar que el evento existe si se proporciona
  if (eventId) {
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (!event) {
      return { error: "Evento no encontrado" };
    }
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { error: wishlistError } = await supabase.from("wishlists").insert({
    id,
    slug,
    name,
    secret_code: secretCode,
    event_id: eventId || null,
  });

  if (wishlistError) {
    return { error: "Error al crear la lista" };
  }

  const giftsToInsert = gifts
    .filter((g) => g.trim())
    .map((g) => ({
      id: createId(),
      wishlist_id: id,
      name: g.trim(),
    }));

  if (giftsToInsert.length > 0) {
    const { error: giftsError } = await supabase
      .from("gifts")
      .insert(giftsToInsert);

    if (giftsError) {
      return { error: "Error al crear los regalos" };
    }
  }

  return {
    slug,
    secretCode,
    eventId: eventId || null,
  };
}

// Obtener una lista por slug
export async function getWishlistBySlug(slug: string) {
  const { data: wishlist, error } = await supabase
    .from("wishlists")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !wishlist) {
    return null;
  }

  const { data: gifts } = await supabase
    .from("gifts")
    .select("*")
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: true });

  // Obtener info del evento si existe
  let event = null;
  if (wishlist.event_id) {
    const { data: eventData } = await supabase
      .from("events")
      .select("id, name")
      .eq("id", wishlist.event_id)
      .single();
    event = eventData;
  }

  return {
    ...wishlist,
    gifts: gifts || [],
    event,
  };
}

// Reservar un regalo
export async function reserveGift(giftId: string) {
  const { error } = await supabase
    .from("gifts")
    .update({ reserved: true })
    .eq("id", giftId);

  return { success: !error };
}

// Verificar código secreto de lista
export async function verifySecretCode(slug: string, code: string) {
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id, secret_code")
    .eq("slug", slug)
    .single();

  if (!wishlist) {
    return { valid: false, error: "Lista no encontrada" };
  }

  if (wishlist.secret_code !== code) {
    return { valid: false, error: "Código incorrecto" };
  }

  return { valid: true, wishlistId: wishlist.id };
}

// Actualizar lista
export async function updateWishlist(
  slug: string,
  code: string,
  name: string,
  gifts: { id?: string; name: string }[]
) {
  const verification = await verifySecretCode(slug, code);
  if (!verification.valid) {
    return { error: verification.error };
  }

  const wishlistId = verification.wishlistId!;

  const { error: updateError } = await supabase
    .from("wishlists")
    .update({ name })
    .eq("id", wishlistId);

  if (updateError) {
    return { error: "Error al actualizar" };
  }

  await supabase.from("gifts").delete().eq("wishlist_id", wishlistId);

  const giftsToInsert = gifts
    .filter((g) => g.name.trim())
    .map((g) => ({
      id: createId(),
      wishlist_id: wishlistId,
      name: g.name.trim(),
    }));

  if (giftsToInsert.length > 0) {
    await supabase.from("gifts").insert(giftsToInsert);
  }

  return { success: true };
}

// Eliminar lista
export async function deleteWishlist(slug: string, code: string) {
  const verification = await verifySecretCode(slug, code);
  if (!verification.valid) {
    return { error: verification.error };
  }

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("id", verification.wishlistId);

  if (error) {
    return { error: "Error al eliminar" };
  }

  return { success: true };
}
