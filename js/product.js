import { sb } from "./supabaseClient.js";
import { getCurrentUser } from "./auth.js";

export async function createProduct(payload = {}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const productName = String(
    payload.product_name ||
    payload.name ||
    payload.asin ||
    "Produto sem nome"
  ).trim();

  const cleanPayload = {
    user_id: user.id,
    client_id: payload.client_id || null,

    product_name: productName,
    name: productName,

    asin: payload.asin || null,
    sku: payload.sku || null,
    brand: payload.brand || null,

    marketplace: payload.marketplace || "Amazon BR",

    category: payload.category || null,
    subcategory: payload.subcategory || null,
    niche: payload.niche || null,
    product_phase: payload.product_phase || null,

    fulfillment_type: payload.fulfillment_type || payload.fulfilment_type || payload.fullfilment_type || null,

    current_price: toNumberOrNull(payload.current_price),
    current_reviews: toIntegerOrNull(payload.current_reviews),
    current_rating: toNumberOrNull(payload.current_rating),

    product_url: payload.product_url || null,
    image_url: payload.image_url || null
  };

  const { data, error } = await sb
    .from("products")
    .insert(cleanPayload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listProducts() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getProductById(productId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProduct(productId, payload = {}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const productName = payload.product_name || payload.name;

  const cleanPayload = {
    updated_at: new Date().toISOString()
  };

  if (productName !== undefined) {
    cleanPayload.product_name = productName;
    cleanPayload.name = productName;
  }

  if (payload.client_id !== undefined) cleanPayload.client_id = payload.client_id || null;
  if (payload.asin !== undefined) cleanPayload.asin = payload.asin || null;
  if (payload.sku !== undefined) cleanPayload.sku = payload.sku || null;
  if (payload.brand !== undefined) cleanPayload.brand = payload.brand || null;
  if (payload.marketplace !== undefined) cleanPayload.marketplace = payload.marketplace || "Amazon BR";
  if (payload.category !== undefined) cleanPayload.category = payload.category || null;
  if (payload.subcategory !== undefined) cleanPayload.subcategory = payload.subcategory || null;
  if (payload.niche !== undefined) cleanPayload.niche = payload.niche || null;
  if (payload.product_phase !== undefined) cleanPayload.product_phase = payload.product_phase || null;
  if (payload.fulfilment_type !== undefined) cleanPayload.fulfilment_type = payload.fulfilment_type || null;
  if (payload.current_price !== undefined) cleanPayload.current_price = toNumberOrNull(payload.current_price);
  if (payload.current_reviews !== undefined) cleanPayload.current_reviews = toIntegerOrNull(payload.current_reviews);
  if (payload.current_rating !== undefined) cleanPayload.current_rating = toNumberOrNull(payload.current_rating);
  if (payload.product_url !== undefined) cleanPayload.product_url = payload.product_url || null;
  if (payload.image_url !== undefined) cleanPayload.image_url = payload.image_url || null;

  const { data, error } = await sb
    .from("products")
    .update(cleanPayload)
    .eq("id", productId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(String(value).replace(",", "."));

  return Number.isFinite(number) ? number : null;
}

function toIntegerOrNull(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(String(value).replace(",", "."));

  return Number.isFinite(number) ? Math.round(number) : null;
}
