import { sb } from "./supabaseClient.js";

export async function requireAuth() {
  const { data, error } = await sb.auth.getSession();
  if (error || !data.session) {
    window.location.href = "/pages/login.html";
    return null;
  }
  return data.session.user;
}

export async function getCurrentUser() {
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function logout() {
  await sb.auth.signOut();
  window.location.href = "/pages/login.html";
}

