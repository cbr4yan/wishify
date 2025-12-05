"use server";

import { createId } from "@paralleldrive/cuid2";
import { supabase } from "./supabase";

// Validar PIN (4-8 dígitos)
function isValidPin(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}

// ==================== EVENTOS ====================

// Crear un nuevo evento (PIN obligatorio)
export async function createEvent(name: string, pin: string) {
  if (!isValidPin(pin)) {
    return { error: "El PIN debe tener entre 4 y 8 dígitos" };
  }

  const id = createId();

  const { error } = await supabase
    .from("events")
    .insert({ id, name, secret_code: pin });

  if (error) {
    return { error: "Error al crear el evento" };
  }

  return { id, secretCode: pin };
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
    .select("id, name, created_at")
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

type GiftInput = {
  name: string;
  url?: string;
};

// Crear una nueva lista (PIN obligatorio)
export async function createWishlist(
  name: string,
  gifts: GiftInput[],
  pin: string,
  eventId?: string
) {
  if (!isValidPin(pin)) {
    return { error: "El PIN debe tener entre 4 y 8 dígitos" };
  }

  const id = createId();

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

  const { error: wishlistError } = await supabase.from("wishlists").insert({
    id,
    name,
    secret_code: pin,
    event_id: eventId || null,
  });

  if (wishlistError) {
    return { error: "Error al crear la lista" };
  }

  const giftsToInsert = gifts
    .filter((g) => g.name.trim())
    .map((g) => ({
      id: createId(),
      wishlist_id: id,
      name: g.name.trim(),
      url: g.url?.trim() || null,
    }));

  if (giftsToInsert.length > 0) {
    const { error: giftsError } = await supabase.from("gifts").insert(giftsToInsert);

    if (giftsError) {
      return { error: "Error al crear los regalos" };
    }
  }

  return {
    id,
    secretCode: pin,
    eventId: eventId || null,
  };
}

// Obtener una lista por ID
export async function getWishlistById(id: string) {
  const { data: wishlist, error } = await supabase
    .from("wishlists")
    .select("*")
    .eq("id", id)
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

// Reservar un regalo (guarda quién lo reservó con su PIN)
export async function reserveGift(giftId: string, userPin: string) {
  if (!isValidPin(userPin)) {
    return { success: false, error: "PIN inválido" };
  }

  // Verificar que el regalo no esté ya reservado
  const { data: gift } = await supabase
    .from("gifts")
    .select("reserved")
    .eq("id", giftId)
    .single();

  if (gift?.reserved) {
    return { success: false, error: "Este regalo ya está reservado" };
  }

  const { error } = await supabase
    .from("gifts")
    .update({ reserved: true, reserved_by: userPin })
    .eq("id", giftId);

  return { success: !error };
}

// Desreservar un regalo (solo si el PIN coincide)
export async function unreserveGift(giftId: string, userPin: string) {
  if (!isValidPin(userPin)) {
    return { success: false, error: "PIN inválido" };
  }

  // Verificar que el usuario es quien reservó
  const { data: gift } = await supabase
    .from("gifts")
    .select("reserved_by")
    .eq("id", giftId)
    .single();

  if (gift?.reserved_by !== userPin) {
    return { success: false, error: "No puedes cancelar esta reserva" };
  }

  const { error } = await supabase
    .from("gifts")
    .update({ reserved: false, reserved_by: null })
    .eq("id", giftId);

  return { success: !error };
}

// Verificar código secreto de lista
export async function verifySecretCode(id: string, code: string) {
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id, secret_code")
    .eq("id", id)
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
  id: string,
  code: string,
  name: string,
  gifts: GiftInput[]
) {
  const verification = await verifySecretCode(id, code);
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
      url: g.url?.trim() || null,
    }));

  if (giftsToInsert.length > 0) {
    await supabase.from("gifts").insert(giftsToInsert);
  }

  return { success: true };
}

// Eliminar lista
export async function deleteWishlist(id: string, code: string) {
  const verification = await verifySecretCode(id, code);
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
