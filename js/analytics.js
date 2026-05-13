import { sb } from "./supabaseClient.js";

export async function trackEvent(eventName, metadata = {}) {
  try {
    const { data: userData } = await sb.auth.getUser();
    const user = userData?.user;

    if (!user?.id || !eventName) return;

    const urlParams = new URLSearchParams(window.location.search);

    const productId =
      metadata.product_id ||
      urlParams.get("product_id") ||
      localStorage.getItem("nx_product_id") ||
      null;

    const diagnosticId =
      metadata.diagnostic_id ||
      urlParams.get("diagnostic_id") ||
      localStorage.getItem("nx_diagnostic_id") ||
      null;

    const clientId =
      metadata.client_id ||
      urlParams.get("client_id") ||
      null;

    const payload = {
      user_id: user.id,
      event_name: eventName,
      page: window.location.pathname,
      product_id: productId || null,
      client_id: clientId || null,
      diagnostic_id: diagnosticId || null,
      metadata: {
        ...metadata,
        url: window.location.href,
        title: document.title || null,
        tracked_at: new Date().toISOString()
      }
    };

    const { error } = await sb
      .from("usage_events")
      .insert(payload);

    if (error) {
      console.warn("Nexora analytics error:", error);
    }
  } catch (error) {
    console.warn("Nexora analytics unavailable:", error);
  }
}

export function trackPageView(pageName = "") {
  return trackEvent("page_view", {
    page_name: pageName || document.title || window.location.pathname
  });
}
